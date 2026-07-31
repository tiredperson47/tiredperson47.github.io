# **SHELF Loading**
# Table of Contents
1. [Introduction](#introduction)
2. [Workflow](#workflow)
3. [How it Works](#how-it-works)
4. [Process Injection](#process-injection)
5. [Payload](#payload)
6. [Mapping Stuff](#mapping-stuff)
7. [Writing Stuff](#writing-stuff)
8. [Memory Protection](#memory-protection)
9. [Memory Cleanup](#memory-cleanup)
10. [Detection](#detection)
11. [Summary](#summary)
12. [Resources](#resources)

# Introduction

Reflective loading is a method commonly used in windows to bypass detection mechanisms that monitor DLL loading via `LoadLibrary`. It works by loading the DLL directly into memory using a custom loader to manually parse the PE headers, handle imports, relocate code, etc. SHELF loading is the Linux equivalent of reflective loading. The name was inspired by ULEXEC’s SHELF loading article. 

In this blog, I will talk about the workflow and how my way of SHELF loading works. Additionally, I have also released a GitHub [repository](https://github.com/tiredperson47/Obfuscation/tree/main/shelf) containing proof-of-concept (PoC) code with a working payload.

# Workflow

This is the general workflow of how my SHELF loader works. 

![Workflow Diagram](/blogs/2/SHELF-workflow.png)

1. Through some process injection primitive, I force the target process to perform `mmap`.
2. Then I inject the payload that is stored in hex within a header file. 
3. To better blend in with the mappings, I parse the `PT_LOAD` segments to apply memory permissions by page. This way, there isn’t a large Read/Execute region of memory when viewing `/proc/<PID>/maps`. 
4. Once the payload finishes, it uses a gadget from libc to build a ROP chain which unmaps the payload and uses `rt_sigreturn` to restore the process to its original state. 

And that is basically the whole workflow of my SHELF loader.

# How it Works

## Process Injection

For the process injection stuff, I didn’t use any novel technique. It’s simply `ptrace`, and force the process to execute commands using syscalls. Because of that, I won’t go too in-depth about it. If you want to learn more about process injection, I highly recommend reading [The Definitive Guide to Linux Process Injection by Ori David](https://www.akamai.com/blog/security-research/the-definitive-guide-to-linux-process-injection) and [Linux Process Injection via Seccomp Notifier by Kyle Avery](https://www.outflank.nl/blog/2025/12/09/seccomp-notify-injection/).

To quickly summarize what I did, I attached the injector to the target process using `ptrace`. If you’re unfamiliar with it, `ptrace` is a tool that many debuggers, such as GDB, use to control the process and actually debug it. It allows you to stop the process, continue it, and modify it on the fly. Using this as an injection primitive, we can stop the target process, write our `mmap` syscall or payload, and continue execution so that it runs our injected code. 

## Payload

If you’ve coded in assembly before, you are probably already familiar with the different sections of an ELF file and where different data goes, like `.text`, `.data`, `.bss`, etc., but beyond that, we have to understand the ELF file format. If you’re not familiar with it, this is a good diagram of how an ELF binary is structured. I will be referencing stuff from this diagram throughout the blog:

![ELF Binary Diagram](/blogs/2/SHELF-ELF.png)

When we load an ELF binary, we generally want to make sure it is a static Position Independent Executable/Code (PIE/PIC). This means that all code, libraries, and headers are compiled into the binary and is simply an offset of the base address rather than referencing absolute/hardcoded memory addresses. The difference between PIE and PIC is that PIEs allow for randomization of the program’s base address, while PICs are for shared libraries and can be relocated at runtime. To me, it doesn’t really matter which one you use for the payload because either way, it’s executed the same way. However, the general best practice is to use PICs because it would closely align with how DLL reflective loading works, along with the fact that it can be relocated anywhere.

Something to note is that having a statically compiled binary will increase the size of the payload simply because you’re integrating libc and all other libraries/headers used. However, I’m sure there are many ways to compress the size.

## Mapping Stuff

To actually load your payload, you need some way to get your payload to your injector. If you want to include the payload statically in the loader, a cool trick is to simply use the `xxd` command with the `-i` flag. This will convert the ELF payload into a C-style include file, which allows you to easily parse the payload. Alternatively, you can do the staged method and somehow grab the payload from a C2 server, but for simplicity, I just use a header file. 

The first thing we do is store the agent payload into a variable and parse the ELF headers table. The ELF header table describes how the ELF is formatted, the architecture type, where the program/section headers are, etc. The main thing we want to find out is where the Program Header Table (PHT) is located. This is done by looking at the `e_phoff` variable, which gives us the offset from the base address telling where the PHT is located in memory. From there, we can parse the `PT_LOAD` segments, which tell us the memory address offset of the page, the size, and the memory permissions it should have. It essentially tells us how we’re going to map out and load the program. 

```c
// Gather PT_LOAD segments to calculate memory size and protection permissions
for (int i = 0; i < hdr->e_phnum; i++) {
    if (phdr[i].p_type == PT_LOAD) {
        if (seg_count >= MAX_SEGMENTS) return 0;
        segments[seg_count++] = (load_segment) {
            .vaddr = phdr[i].p_vaddr,
            .memsz = phdr[i].p_memsz,
            .flags = phdr[i].p_flags,
        };
        if (phdr[i].p_vaddr < min_vaddr) min_vaddr = phdr[i].p_vaddr;
        if ((phdr[i].p_vaddr + phdr[i].p_memsz) > max_vaddr) max_vaddr = phdr[i].p_vaddr + phdr[i].p_memsz;
    }
}
```

Next we have to map out memory to the remote process. This isn’t necessary if you can find a Read/Write region of memory that can hold your payload, and you’re injecting pure shellcode. However, if you aren’t injecting pure shellcode and instead injecting an actual ELF payload, then you’re better off mapping out memory using `mmap`. This is because ELF payloads need to be page aligned, which is generally 4 KB. The reason for this is because you don’t want to have overlapping sections such as `.text`, `.bss`, `.rodata`, etc. If you do, then when you apply page based memory protections, some executable code could be stored in the `.rodata` section, and result in a segfault. In my case, I map out the memory region regardless for this reason, and the fact that it makes cleanup a lot easier. 

When performing process injection, it’s always important to restore the process to its original state after execution. This is because if you inject into a sensitive process and your code finishes, then the process would crash. If you imagine process injection as a car, you’re effectively stopping the car and detouring it to a different location. However, if the road suddenly ends then it doesn’t know where to go next, so it crashes. To solve this problem, we can write a struct to the same mapped out memory region so that our payload can read the data, and perform the cleanup for us. 

```c
remote_syscall(pid, registers, syscall_rip, __NR_mmap, 0, payload_size + struct_size, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0, &syscall_result);
```

Using `ptrace`, the above function call would look something like this:

```c
regs->rax = ssn;  // Syscall number for mmap = 9
regs->rdi = arg0; // Payload size + struct size
regs->rsi = arg1; // Memory permissions
regs->rdx = arg2; // file descriptor (none)
regs->r10 = arg3; // No offset
regs->rip = rip;

iov.iov_base = regs;
iov.iov_len = sizeof(*regs);
if (ptrace(PTRACE_SETREGSET, pid, NT_PRSTATUS, &iov) == -1) {
    goto restore_original;
}

if (ptrace(PTRACE_CONT, pid, NULL, NULL) == -1) {
    goto restore_original;
}
```

## Writing Stuff

Using a process write primitive of your choice, you simply need to write out your payload and struct to the mapped out memory region. You can use `process_vm_writev`, the `procfs` file system, `ptrace`, `io_uring`, etc. Once again, I’m going to use `ptrace`. 

```c
for (size_t i = 0; i < payload_size; i += sizeof(long)) {
    long chunk = 0;

    size_t remaining = payload_size - i;
    size_t copy_size = remaining < sizeof(long) ? remaining : sizeof(long);

    if (copy_size != sizeof(long)) {
        // read existing memory to avoid clobbering
        errno = 0;
        chunk = ptrace(PTRACE_PEEKTEXT, pid, address + i, NULL);
        if (chunk == -1 && errno != 0) {
            return -1;
        }
    }

    sys_memcpy(&chunk, payload + i, copy_size); // manual reimplementation of memcpy()

    if (ptrace(PTRACE_POKETEXT, pid, address + i, chunk) == -1) {
        return -1;
    }
}
```

`ptrace` can only write one word (8 bytes) at a time. So over large amounts of data, `ptrace` would be called several hundreds or thousands of times just to write your payload. This is also the reason why `ptrace` is so easily detected with AV and EDRs. A better method would be to use `process_vm_writev` since it can write a large chunk of data at a time.

## Memory Protection

To better blend in with normal memory mappings, we can also apply page based memory protections. This way we don’t have a large region of Read/Execute memory, and could easily be detected. To do this, we can use the data obtained from the previous `PT_LOAD` segments. 

```c
// apply memory protections based on segments
for (int i = 0; i < seg_count; i++) {
    uintptr_t start = pie_base_addr + segments[i].vaddr;
    uintptr_t end   = start + segments[i].memsz;
    
    // mprotect requires page-aligned addresses
    uintptr_t aligned_start = start & ~(PAGESIZE - 1);
    uintptr_t aligned_end   = (end + PAGESIZE - 1) & ~(PAGESIZE - 1);
    
    int prot = 0;
    if (segments[i].flags & PF_R) prot |= PROT_READ;
    if (segments[i].flags & PF_W) prot |= PROT_WRITE;
    if (segments[i].flags & PF_X) prot |= PROT_EXEC;
    
    remote_syscall(params->pid, params->regs, params->syscall_rip, __NR_mprotect, (unsigned long)aligned_start, aligned_end - aligned_start, prot, 0, 0, 0, &syscall_result);
}
```

However, in my case, it comes with the downside of having to call ptrace multiple times, which can easily lead to detection. Although, I suppose it's possible to initially execute your payload with RX permissions, and change it later during runtime.

Once this is done, you can continue the remote process’s execution and detach from the injector process. The injector will exit and the kernel will clean it up while the remote process executes your payload.

## Memory Cleanup

As previously mentioned, memory cleanup is very important, but it’s also hard on Linux because unlike Windows, there’s no way to just suddenly restore a process’s context using a thread. We also don’t want to spawn new processes, open a new file descriptor, or keep our injector process because it’s very noisy and easy to detect. 

The cleanest way to restore the process without leaving a trace is to use a ROP chain and the `rt_sigreturn` syscall. If you’re unfamiliar with ROP chaining, it essentially uses a chain of gadgets (code found within the memory of loaded libraries) to set registers and perform a syscall. I intend to make another blog about it eventually, so look forward to that.

The biggest thing to talk about it `rt_sigreturn` because this syscall is responsible for restoring the process to its original state. Unlike normal syscalls where you pass multiple arguments through the registers, `rt_sigreturn` doesn’t take arguments. Instead, you enter `rt_sigreturn` by setting the `rsp` register to the frame address + 8, because `rt_sigreturn` does the following operation:

```c
frame = (struct rt_sigframe __user *)(regs->sp - sizeof(long));
```

When using a ROP gadget, the frame address + 8 is automatically done when you use the `ret` instruction. 

`rt_sigreturn` uses the `rt_sigframe` struct to store the data needed to restore the process, and on x86_64 architecture, it looks like this:

```c
struct rt_sigframe {
	char __user *pretcode; // 8 bytes
	struct ucontext uc;
	struct siginfo info;
};
```

Because it uses this struct, we need to manually set the values of the struct by using offsets from the frame base address. Calculating the offsets isn’t that hard. In the above struct we see that `pretcode` is 8 bytes. We don’t really care about this variable so we can skip straight to the `ucontext` struct and define a macro at offset `0x8` which in decimal equals 8. 

In the `ucontext` struct, we have the following fields:

```c
struct ucontext {
	unsigned long	  uc_flags;      // 8 bytes = FRAME_UC + 0x0
	struct ucontext  *uc_link;     // 8 bytes (skip this)
	stack_t		  uc_stack;          // 24 bytes = FRAME_UC + 0x10
	struct sigcontext uc_mcontext; // 256 bytes
	sigset_t	  uc_sigmask;
};
```

For simplicity sake, we can just take the offset of the `uc` struct and add the offsets within the `ucontext` struct. The only thing we don’t care about is the `uc_link` because `rt_sigreturn` either doesn’t use it. The others do the following:

- `uc_flags`: Controls parts of the restore behavior. You can zero it out, but a real
- `uc_stack`: Used if we want to restore based on an alternate signal stack. We don’t have one so we use `SS_DISABLE` to turn it off.
- `uc_mcontext`: stores the values of the backed up registers plus some.
- `uc_sigmask`: restores the thread’s blocked signal mask. It acts as a blocker rather than immediately sending the signal. It is used in signal handling where you can perform actions upon hitting certain signals. For a fake frame, setting it to ‘0’ is fine.

To properly set the `uc_mcontext` struct, we have to set them in order because each variable is stored as an offset.

```c
struct sigcontext_64 {
	__u64				r8;           // __u64 = 8 bytes
	__u64				r9;
	__u64				r10;
	__u64				r11;
	__u64				r12;
	__u64				r13;
	__u64				r14;
	__u64				r15;
	__u64				di;
	__u64				si;
	__u64				bp;
	__u64				bx;
	__u64				dx;
	__u64				ax;
	__u64				cx;
	__u64				sp;
	__u64				ip;
	__u64				flags;
	__u16				cs;           // __u16 = 2 bytes
	__u16				gs;           // skip
	__u16				fs;           // skip
	__u16				ss;
	__u64				err;          // skip
	__u64				trapno;       // skip
	__u64				oldmask;      // skip
	__u64				cr2;          // skip
	__u64				fpstate;
	__u64				reserved1[8]; // 64 bytes (skip)
};
```

# Detection

When performing SHELF loading, we use an injection primitive such as `ptrace`, `process_vm_writev`, `procfs`, and sometimes seccomp filters. So obviously, these syscalls should be monitored. In production environments, the use of debugging primitives like `ptrace` is unusual, especially if there are no known debuggers running. 

Seccomp filters is a bit of a special case because there are valid tools that use it as a way for host-based defense. For example, seccomp (with BPF filters) is sometimes used in defensive tooling to monitor, allow, deny, or trap syscalls. This is commonly used by HIDS/EDR agents and sandboxing systems. This brings up a point of using syscall hooking. Syscall hooking is a common technique used in Windows AV/EDR. Essentially what it’s doing is, if a process calls a sensitive syscall like `mmap`, `execve`, `mprotect`, etc., then we trampoline the syscall in order to log the usage and determine whether to allow or deny use of the syscall. For a better explanation, you can just search up “Windows API Hooking”.

Aside from monitoring system calls, it’s also important to track suspicious process activities and actions. For instance, a process should rarely be writing/attaching to another remote process unless you’re using a debugger like GDB. If you notice that a process is writing data to another process, that is a strong indicator of a potential process injection attempt. Other indicators of compromise would be suspicious memory protections like RWX permissions, `mprotect` operations, and unexpected thread creation. 

`Procfs` is a valuable interface to parse and analyze a process’s memory mappings, memory protections, threads, and file descriptors. Below are some usages:

- `/proc/<pid>/maps` → memory layout
- `/proc/<pid>/smaps` → memory usage + permissions
- `/proc/<pid>/task/*` → threads
- `/proc/<pid>/fd/*` → file descriptors

In addition to `procfs`, it is also valuable to debug a process using GDB. If used correctly, GDB can uncover a lot about what happened to the process, what was overwritten, what is executing, and so on. The biggest thing is that you can stop and analyze the payload as it’s running to reverse engineer it during runtime (though this should be done with outbound connections denied). 

Below are some examples of using `procfs` to detect suspicious process actions (for context, the injected process is a netcat listener):

Before process injection:

![Procfs Before Injection](/blogs/2/SHELF-before.png)

After process injection:

![Procfs After Injection](/blogs/2/SHELF-after.png)

- We see there is an unusually large amount of memory mapped below the heap.

Unexpectedly created thread (PID 17865):

![Unexpected Created Threads via Procfs](/blogs/2/SHELF-threads.png "w=315px h=100px")

Suspicious usage of `io_uring`:

![Unusual use of io_uring](/blogs/2/SHELF-io_uring.png)

It’s important to note that these footprints only appeared because I forced the target process to perform `mmap`, and my payload uses `io_uring`. If the injected payload was more advanced and the injection method was better, these kinds of footprints may not appear. 

# Summary

By combining advanced process injection techniques and implementing a custom ELF loader, attackers can bypass many detection mechanisms and closely replicate how reflective loading works on Windows. However, by implementing solid detection and logging, organizations can improve their security posture and easily prevent these types of attacks. 

# Resources

- [The Definitive Guide to Linux Process Injection by Ori David](https://www.akamai.com/blog/security-research/the-definitive-guide-to-linux-process-injection)
- [x64 rt_sigframe struct](https://raw.githubusercontent.com/torvalds/linux/master/arch/x86/include/asm/sigframe.h)
- [x64 rt_sigreturn function](https://raw.githubusercontent.com/torvalds/linux/master/arch/x86/kernel/signal_64.c)
- [x86_64 rt_sigcontext struct](https://raw.githubusercontent.com/torvalds/linux/master/arch/x86/include/uapi/asm/sigcontext.h)
- [ucontext struct](https://raw.githubusercontent.com/torvalds/linux/master/include/uapi/asm-generic/ucontext.h)