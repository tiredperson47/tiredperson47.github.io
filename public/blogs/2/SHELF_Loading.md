# Table of Contents
1. [Introduction](#introduction)
2. [Workflow](#workflow)
3. [Process Injection](#process-injection)
4. [Payload](#payload)
5. [ELF Loader](#elf-loader)
6. [Creating Shellcode](#creating-shellcode)
7. [Detection](#detection)
8. [Summary](#summary)

# Introduction

Reflective loading is a method commonly used in windows to bypass detection mechanisms that monitor DLL loading via `LoadLibrary`. It works by loading the DLL directly into memory using a custom loader to manually parse the PE headers, handle imports, relocate code, etc. SHELF loading is the Linux equivalent of reflective loading. The name was inspired by ULEXEC’s SHELF loading article. 

In this blog, I will talk about the workflow and how my way of SHELF loading works. Additionally, I have also released a GitHub [repository](https://github.com/tiredperson47/Obfuscation/tree/main/shelf) containing proof-of-concept (PoC) code with a working payload.

# Workflow

This is the general workflow of how my SHELF loader works. 

![Workflow Diagram](/blogs/2/SHELF-workflow.png "w=400px h=900px")

1. Through some process injection primitive, I force the target process to perform `mmap`. This is only because the payload I was testing with was very large lol. Otherwise, you probably don’t need to force `mmap`. Instead, you can simply write over the process’s mapped memory address that can hold your payload and supports your desired injection primitive. 
2. Then I inject shellcode containing the ELF Loader and a hardcoded payload stored within the `agent.h` header. 
3. Assuming the payload is a static pie/pic, we load the payload into the memory through `mmap` and apply the necessary memory protections. All of this is done by creating a fake stack and parsing the Program Headers to find the proper memory permissions. 
4. Within the payload, there is a breakpoint. If the payload is finishing execution, we set a breakpoint that is then caught by the injector. This allows us to clean up the injected process so that it can run normally even after the payload quits. This is just for general OPSEC in case we inject into a sensitive process. 

And that is basically the whole workflow of my SHELF loader. The code itself probably isn’t optimized, but if it works, don’t touch it, right?

# How it Works

## Process Injection

For the process injection stuff, I didn’t use any novel technique. It’s simply `ptrace`, and force the process to execute commands using syscalls. Because of that, I won’t go too in-depth about it. If you want to learn more about process injection, I highly recommend reading [The Definitive Guide to Linux Process Injection](https://www.akamai.com/blog/security-research/the-definitive-guide-to-linux-process-injection) by Ori David and [Linux Process Injection via Seccomp Notifier](https://www.outflank.nl/blog/2025/12/09/seccomp-notify-injection/) by Kyle Avery.

To quickly summarize what I did, I attached the injector to the target process using `ptrace`. If you’re unfamiliar with it, `ptrace` is a tool that many debuggers, such as GDB, use to control the process and actually debug it. It allows you to stop the process, continue it, and modify it on the fly. Using this as an injection primitive, we can stop the target process, write our `mmap` syscall or payload, and continue execution so that it runs our injected code. 

## Payload

If you’ve coded in assembly before, you are probably already familiar with the different sections of an ELF file and where different data goes, like `.text`, `.data`, `.bss`, etc., but beyond that, we have to understand the ELF file format. If you’re not familiar with it, this is a good diagram of how an ELF binary is structured. I will be referencing stuff from this diagram throughout the blog:

![ELF Binary Diagram](/blogs/2/SHELF-ELF.png)

When we load an ELF binary, we generally want to make sure it is a static Position Independent Executable/Code (PIE/PIC). This means that all code, libraries, and headers are compiled into the binary and is simply an offset of the base address rather than referencing absolute/hardcoded memory addresses. The difference between PIE and PIC is that PIEs allow for randomization of the program’s base address, while PICs are for shared libraries and can be relocated at runtime. To me, it doesn’t really matter which one you use for the payload because either way, it will be executed the same way. However, the general best practice is to use PICs because it would closely align with how DLL reflective loading works, along with the fact that it can be relocated anywhere.

Something to note is that having a statically compiled binary will increase the size of the payload simply because you’re integrating libc and all other libraries/headers used. However, I’m sure there are many ways to compress the size.

## ELF Loader

The ELF loader, as implied, loads the ELF payload into memory and transfers execution to the payload. In essence, it replicates how `execve` executes binaries by loading them into memory. This is probably the hardest step of SHELF loading.

If you want to include the payload statically in the loader, a cool trick is to simply use the `xxd` command with the `-i` flag. This will convert the ELF payload into a C-style include file, which allows you to easily parse the payload. Alternatively, you can do the staged method and somehow grab the payload from a C2 server, but for simplicity, I just use a header file. 

Skipping the ELF validation step, the first thing we do is store the agent payload into a variable and parse the ELF headers table. The ELF header table describes how the ELF is formatted, the architecture type, where the program/section headers are, etc. The main thing we want to find out is where the program header table is located. This is done by looking at the `e_phoff` variable. From there, we can parse the `PT_LOAD` segments, which tell us how much memory to allocate, what the offset should be for each page, and how they’re aligned. It essentially tells us how we’re going to map out and load the program. 

```c
ElfN_Ehdr *hdr = (ElfN_Ehdr *)elf_start;

ElfN_Phdr *phdr = (ElfN_Phdr *)(elf_start + hdr->e_phoff);

for (int i = 0; i < hdr->e_phnum; i++) {
    if (phdr[i].p_type == PT_LOAD) {
        if (seg_count >= MAX_SEGMENTS) return 0;
        segments[seg_count++] = (load_segment) {
            .vaddr = phdr[i].p_vaddr, .memsz = phdr[i].p_memsz,
            .filesz = phdr[i].p_filesz, .offset = phdr[i].p_offset,
            .flags = phdr[i].p_flags, .align = phdr[i].p_align
        };
        if (phdr[i].p_vaddr < min_vaddr) min_vaddr = phdr[i].p_vaddr;
        if ((phdr[i].p_vaddr + phdr[i].p_memsz) > max_vaddr) max_vaddr = phdr[i].p_vaddr + phdr[i].p_memsz;
    }
}
```

After that, we need to map out a space in memory that will hold our payload. To do this, I implemented a `mmap` syscall so that I don’t have to touch libc when executing the loader. This is because shellcode cannot rely on external runtime linking, such as libc. I’ll get into this later. Another thing to note is that we need to page-align the mapped memory. This is because by default, when you `mmap` a space in memory, it’s just a raw, unformatted space of memory that isn’t suitable for ELF programs to be loaded into. Generally, the default page size is 4096 bytes (4 KB), so we use that page size to align everything.

```c
size_t alloc_sz = memsz + PAGESIZE;
char *mapping_raw = sys_mmap(NULL, alloc_sz, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
if ((long)mapping_raw < 0) return -1;

ElfN_Addr pie_base = (ElfN_Addr)(((uintptr_t)mapping_raw + (PAGESIZE - 1)) & ~(uintptr_t)(PAGESIZE - 1)) - min_vaddr;

for (int i = 0; i < seg_count; i++) {
    void *dst = (void *)(pie_base + segments[i].vaddr); 
    void *src = (void *)(elf_start + segments[i].offset);
    sys_memcpy(dst, src, segments[i].filesz);
    if (segments[i].memsz > segments[i].filesz) {
        sys_memset((char *)dst + segments[i].filesz, 0, segments[i].memsz - segments[i].filesz); 
    }
}
```

The main thing about the `pie_base` line is that we want to round everything up. If we have data that is larger than the 4 KB page, then we want to round it up to the next page boundary. This prevents data loss from happening, and because `mmap` and `mprotect` operate on page aligned regions.

If you are curious about why we subtract `min_vaddr`, it’s because we want to make sure the first segment lands exactly at the aligned address, which follows the equation `aligned_addr = pie_base + min_vaddr`. So, `pie_base = aligned_addr - min_vaddr`. This ensures the loaded segments are correctly positioned relative to the allocated base.

Using the segments struct that we created for each `PT_LOAD` header, we want to apply the memory protections that were specified within the `PT_LOAD` header. This is primarily for OPSEC because we want to avoid having RWX memory protections, which is a strong indicator of malware, but it also enforces correctness. 

```c
for (int i = 0; i < seg_count; i++) {
    uintptr_t start = pie_base + segments[i].vaddr;
    uintptr_t end   = start + segments[i].memsz;
    
    // mprotect requires page-aligned addresses
    uintptr_t aligned_start = start & ~(PAGESIZE - 1);
    uintptr_t aligned_end   = (end + PAGESIZE - 1) & ~(PAGESIZE - 1);
    
    int prot = 0;
    if (segments[i].flags & PF_R) prot |= PROT_READ;
    if (segments[i].flags & PF_W) prot |= PROT_WRITE;
    if (segments[i].flags & PF_X) prot |= PROT_EXEC;
    
    sys_mprotect((void *)aligned_start, aligned_end - aligned_start, prot);
}
```

For the stack, we have to create a fake one because injected shellcode isn’t loaded with a valid stack like you would if you were executing an ELF program directly. This is also why we can’t just pass `argv`, `envp`, `argc`, etc., because we have no stack to reference from. To achieve this fake stack, we once again need to mmap a space of memory, 16 byte align it, and fill in the stack with `argc`, `argv`, `envp`, and `auxv`. Below is the code of the important part. 

```c
sp -= (14 * sizeof(ElfN_Addr));
sp = (char *)((uintptr_t)sp & ~0xF); // Force 16-byte alignment

ElfN_Addr *out = (ElfN_Addr *)sp;
*out++ = 1;                         // argc
*out++ = (ElfN_Addr)execfn;         // argv[0]
*out++ = 0;                         // argv terminator
*out++ = 0;                         // envp terminator

*out++ = AT_PHDR;   *out++ = pie_base + hdr->e_phoff;
*out++ = AT_PHENT;  *out++ = hdr->e_phentsize;
*out++ = AT_PHNUM;  *out++ = hdr->e_phnum;
*out++ = AT_PAGESZ; *out++ = PAGESIZE;
*out++ = AT_RANDOM; *out++ = (ElfN_Addr)randbuf;
*out++ = AT_NULL;   *out++ = 0;
```

It is important to note that this is a minimal `auxv`, and more complex payloads may require more `auxv` entries like `AT_BASE` or something. 

If you don’t know how the stack works, it’s essentially a contiguous space of memory that follows the Last In First Out (LIFO) method. The memory also grows downwards, meaning that as more memory gets pushed to the stack, it will be stored at a lower memory address. Although the code is writing upward (low to high memory address), with a fake stack, it’s more flexible in how it’s formatted, so it’s fine. Below is how a stack is supposed to look like, and although the stack is written in increasing memory order during construction, the final stack pointer (`rsp`) is set so that the payload still follows a downward-growing stack. So, when you push to the stack, the stack still grows downwards, it’s just a little awkward looking because it would be below `argc` (because `argc` is at a lower memory address in my case).

![Stack Layout Diagram](/blogs/2/SHELF-stack.png)

Now that we have loaded our payload into memory and created a bare minimum stack, we can transfer execution from the loader to the payload.

```c
__attribute__((noreturn))
void amd_jump(ElfN_Addr sp, void *entry) {
    asm volatile(
        "mov %0, %%rsp\n"
        "xor %%rbp, %%rbp\n"
        "xor %%rdx, %%rdx\n"
        "jmp *%1\n"
        : : "r"(sp), "a"(entry) : "memory"
    );
    __builtin_unreachable();
}
```

In this code, `rsp` refers to the loader’s stack. By moving the loader’s stack to the fake stack, we prepare to transfer execution from the loader to the payload. We then zero out the `rbp` and `rdx` registers so that we don’t accidentally load garbage data. Finally, we jump to the entry point of our payload and officially transfer execution from the loader to the payload. 

That is all the loader needs to do. In my implementation, the payload is compiled as a static PIE/PIC and doesn’t require relocations; however, if you decide to use an injection primitive like the seccomp filter, you may need to handle relocations manually due to it requiring dynamic binaries. 

## Creating Shellcode

For those who are unfamiliar, shellcode is a contiguous, self-contained blob of executable machine code designed to be injected into a program's memory and executed blindly by the CPU. So in essence, the machine can simply start at the beginning of the shellcode and execute it without having to deal with relocations, dependencies, etc. It’s just run and go. Some caveats about shellcode is that it must follow these rules:

1. Headerless (Flat Binary)
    1. No ELF headers, program headers, relocations, etc. You run and go.
2. Position Independent
    1. The code must not have any hardcoded addresses. This way, it can be placed anywhere and would execute normally. Basically, everything is an offset with no reference to hardcoded memory addresses. 
3. Free Standing
    1. It must not have any dependencies such as libc. So, if you want to use things like `printf`, `malloc`, etc, you have to manually recreate them, or use syscalls (since `malloc` is just a libc wrapper to use the syscall).
4. Agnostic process state
    1. Cannot assume that it will have a valid stack, take command line arguments, use environmental variables, etc. You have to hardcode any data that you may need.
5. Null Free
    1. In the scenario that you have to use things like `strcpy` to copy over your payload, if your shellcode has a null terminator, your payload will be cut in half due to `strcpy` stopping at null terminators. This is why you use `xor eax, eax` to get `0` values instead of null terminators. 

To achieve this, we can use a custom linker script and the following flags from GCC. 

1. `-fPIC`: Generates position-independent code (PIC)
2. `-ffreestanding`: Tells the compiler that the program may not start at main()
3. `-fno-builtin`: Prevents the compiler from optimizing code and prevents the compiler from inserting libc function calls for no reason. 
4. `-fno-stack-protector`: Gets rid of the buffer overflow protection (random value canary which uses TLS), but since shellcode doesn’t have these, we don’t need them
5. `-nostdlib`: Don’t use standard startup libraries like libc. Prevents bloating the shellcode. 
6. `-nodefaultlibs`: Ensures default libraries like libc aren’t compiled into the binary as well. 
7. `-fvisibility=hidden`: Tells the compiler that there will be no relocations
8. `-c`: Compile the code but stop before linking it. This way, we can use our linker script. 

For the linker part, in the loader, you should have a section like this:

```c
__asm__ (
    ".section .text.entry\n"
    ".global _start\n"
    "_start:\n"
    "andq $-16, %rsp\n"
    "call main_loader\n"
    "int3\n"
);
```

This inline assembly will be used to place the start of the shellcode. The biggest part is the `.text.entry` as we will be using this as a function to instantly jump to the start of our shellcode. This is what allows the loader to be written to memory in a process and immediately be executed by the computer without any relocations/formatting. 

Then, when you combine it with a custom linker script, we say that we want the code to load at address `0x0` (because we wrote the loader into mmapped memory), and at the very start we want to jump to `.text.entry`, which is a function within our loader. The above inline assembly then 16 byte aligns the stack and calls our main function. We also include the `.rodata`, `.data`, and `.bss` sections just in case the loader has variables that need to be stored there. 

```nasm
ENTRY(_start)
SECTIONS
{
    . = 0x00000000;

    .text : {
        *(.text.entry)
        *(.text .text.*)
    }

    .rodata : {
        *(.rodata .rodata.*)
    }

    .data : {
        *(.data .data.*)
    }

    .bss : {
        *(.bss .bss.*)
        *(COMMON)
    }
}
```

The point of using a linker script is that it gives us control over how the binary is compiled at the end. If we don’t use a custom linker script, `gcc` will insert various optimizations, elf headers, and other things that would break shellcode rules. 

Once the shellcode is finally compiled and linked, we can use the `xxd` technique to include the shellcode in the injector. 

# Detection

When performing SHELF loading, we use an injection primitive such as `ptrace`, `process_vm_writev`, `procfs`, and sometimes seccomp filters. So obviously, these syscalls should be monitored. In production environments, the use of debugging primitives like `ptrace` is unusual, especially if there are no known debuggers running. 

Seccomp filters is a bit of a special case because there are valid tools that use it as a way for host-based defense. For example, seccomp (with BPF filters) is sometimes used in defensive tooling to monitor, allow, deny, or trap syscalls. This is commonly used by HIDS/EDR agents and sandboxing systems. This brings up a point of using syscall hooking. Syscall hooking is a common technique used in Windows AV/EDR. Essentially, what it’s doing is, if a process calls a sensitive syscall like `mmap`, `execve`, `mprotect`, etc., then we trampoline the syscall in order to log the usage and determine whether to allow or deny use of the syscall. For a better explanation, you can just search up “Windows API Hooking”.

Aside from monitoring system calls, it’s also important to track suspicious process activities and actions. For instance, a process should rarely be writing/attaching to another remote process unless you’re using a debugger like GDB. If you notice that a process is writing data to another process, that is a strong indicator of a potential process injection attempt. Other indicators of compromise would be suspicious memory protections like RWX permissions, `mprotect` operations, and unexpected thread creation. 

`Procfs` is a valuable interface to parse and analyze a process’s memory mappings, memory protections, threads, and file descriptors. Below are some usages:

- `/proc/<pid>/maps` → memory layout
- `/proc/<pid>/smaps` → memory usage + permissions
- `/proc/<pid>/task/*` → threads
- `/proc/<pid>/fd/*` → file descriptors

In addition to `procfs`, it is also valuable to debug a process using GDB. If used correctly, GDB can uncover a lot about what happened to the process, what was overwritten, what is executing, and so on. The biggest thing is that you can stop and analyze the payload as it’s running to kind of reverse engineer it during runtime (though this should be done with outbound connections denied). 

Below are some examples of using `procfs` to detect suspicious process actions (for context, the injected process is a netcat listener):

Before process injection:

![Procfs Before Injection](/blogs/2/SHELF-before.png)

After process injection:

![Procfs After Injection](/blogs/2/SHELF-after.png)

Unexpectedly created thread (PID 17865):

![Unexpected Created Threads via Procfs](/blogs/2/SHELF-threads.png "w=315px h=100px")

Suspicious usage of `io_uring`:

![Usuual use of io_uring](/blogs/2/SHELF-io_uring.png)

It’s important to note that these footprints only appeared because I forced the target process to perform `mmap`, and the payload used `io_uring`. If the injected payload was more advanced and the injection method was better, these kinds of footprints may not appear. 

# Summary

By combining advanced process injection techniques and implementing a custom ELF loader, attackers can bypass many detection mechanisms and closely replicate how reflective loading works on Windows. However, by implementing solid detection and logging, organizations can improve their security posture and easily prevent these types of attacks.
