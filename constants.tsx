
import React from 'react';
import {
  BlogPost, RoadmapNode, Artifact
} from './types';

/**
 * PROJECT STRUCTURE NOTE:
 * Place your blog images in: /blogs/<id>/img.png
 * Place your artifact images in: /artifacts/img.png
 * Place your markdown files in: /blogs/<id>/content.md
 */

export const BLOGS: BlogPost[] = [
  {
    id: "0",
    title: "ITC Writeup",
    summary: "The Information Technology Competition (ITC) is a penetration testing competition similar to CPTC. You are placed in a mock environment and are contracted to perform a vulnerability assessment on the company environment.",
    date: "2024-05-24",
    author: "TiredPerson",
    content: "/blogs/0/ITC.md"
  },
  {
    id: "1",
    title: "Authority HTB Writeup",
    summary: "This medium difficulty machine focuses on ADCS exploitation and introduces interesting concepts like PassTheCert for user impersonation.",
    date: "2024-05-30",
    author: "TiredPerson",
    content: "/blogs/1/Authority.md"
  }
];

export const ROADMAP: RoadmapNode[] = [
  {
    id: '1', label: 'Start', category: 'milestone', status: 'completed',
    description: 'I first started my cybersecurity journey in college where I joined the cybersecurity club and participated in the CCDC bootcamps which SWIFT hosts every summer.',
    gained: ['Joined cybersecurity club (SWIFT)', 'Did CCDC bootcamps', 'Learned basic Linux and networking'],
    x: 100, y: 1200, from: '1', to: ''
  },
  {
    id: '2', label: 'NCAE Cybergames', category: 'competition', status: 'completed',
    description: 'NCAE cybergames is a beginner level collegiate competition that focuses on blue team/incident response and CTF skills.',
    gained: ['Second place nationals', 'Linux incident response skills', 'Linux forensics analysis', 'Set up simple services'],
    x: 250, y: 1100, from: '1', to: '2'
  },
  {
    id: '3', label: 'HTB Pro Labs', category: 'certification', status: 'completed',
    description: 'Hack the Box Pro Labs are full penetration testing environments that tests you in varius aspects of Adverysary Simulation. It primarily focuses on Active Directory exploitation with a few Linux machines mixed in.',
    gained: ['Solidified Penetration Testing methodology', 'Exposed to various AD exploitation techniques', 'Proxying through multiple machines'],
    x: 500, y: 1200, from: '7', to: '3'
  },
  {
    id: '4', label: 'Dante Pro Labs', category: 'certification', status: 'completed',
    description: 'A CPE certification from Hack the Box that is tailored for intermediate penetration testers. It is commonly used as a preparation for the OSCP exam.',
    gained: ['Network tunneling with socks proxies', 'Active Directory exploitation', 'Web application exploitation'],
    x: 625, y: 1150, from: '3', to: '4'
  },
  {
    id: '5', label: 'Zephyr Pro Labs', category: 'certification', status: 'completed',
    description: 'A CPE certification from Hack the Box that is tailored for intermediate penetration testers. It dives deep into Active Directory exploitation, and various post-exploitation and lateral movement techniques. It is comparable to GOAD and great practice for CRTO',
    gained: ['Domain jumping', 'Lateral movement techniques', 'Active Directory exploitation', 'Post-exploitation techniques', 'AV Evasion'],
    x: 625, y: 1250, from: '3', to: '5'
  },
  {
    id: '6', label: 'ITC', category: 'competition', status: 'completed',
    description: 'The Information Technology Competition (ITC) is a penetration testing competition similar to CPTC. You are placed in a mock environment and are contracted to perform a vulnerability assessment on the company environment. At the end, you have to submit a professional report of your findings as well as a presentation to the company executives.',
    gained: ['Two time first place', 'Business communication', 'Offensive security skills', 'Report Writing'],
    x: 250, y: 1300, from: '1', to: '6'
  },
  {
    id: '7', label: 'CPTC', category: 'competition', status: 'completed',
    description: 'Collegiate Penetration Testing Competition (CPTC) is a national level red team competition where collegiate teams compete against each other to perform a penetration test on a mock company environment. It heavily emphasizes business communication and report writing, while also introducing vulnerabilities and tech stacks professionals have seen in the wild.',
    gained: ['Real world expectations', 'Business communication', 'Advanced penetration testing techniques', 'Linux Lead (2024-2025)', 'Windows Lead (2025-2026)'],
    x: 400, y: 1300, from: '6', to: '7'
  },
  {
    id: '8', label: 'CCDC', category: 'competition', status: 'completed',
    description: 'The Collegiate Cyber Defense Competition (CCDC) is a national level blue team competition where collegiate teams compete against each other to defend a mock company environment from red team attacks. It focuses on network defense, incident response, and system hardening skills, with a large emphasis on business communication.',
    gained: ['Incident response skills', 'Network defense skills', 'Linux system hardening skills', 'Business Lead (2024-2025)'],
    x: 400, y: 1100, from: '2', to: '8'
  },
  {
    id: '9', label: 'CRTO', category: 'certification', status: 'completed',
    description: 'The Certified Red Team Operator (CRTO) certification from Zero Point Security focuses on adversary simulation and red teaming techniques in Active Directory environments. It covers topics such as initial access, lateral movement, privilege escalation, and persistence within Windows networks. However, it emphasizes C2 utiization, stealth, evasion, and obfuscation techniques to avoid detection.',
    gained: ['Malware obfuscation', 'C2 utilization', 'Advanced Active Directory exploitation', 'Stealth and evasion techniques', 'OPSEC best practices'],
    x: 750, y: 1300, from: '7', to: '9'
  },
  {
    id: '10', label: 'CRTL', category: 'certification', status: 'in-progress',
    description: "Certified Red Team Leader (CRTL) certification focuses on advanced red teaming and OPSEC techniques. It builds upon the foundational skills learned in the CRTO certification and dives deeper into topics such as how EDR detection works, advanced evasion techniques, and different techniques to maintain persistence without being seen.",
    gained: ['API Call Hooking Understanding', 'General OPSEC'],
    x: 850, y: 1225, from: '9', to: '10'
  },
  {
    id: '11', label: 'SWIFT', category: 'club', status: 'in-progress',
    description: "SWIFT (Students With an Interest in the Future of Technology) is the cybersecurity club at Cal Poly Pomona. I became the Director of Competitions and created fun environments for members to compete and learn cybersecurity skills.",
    gained: ['Recreated known vulnerabilities', 'Hosted CCDC/CPTC bootcamps', 'Directed club competitions', "Hosted RvB competitions for college teams from across the nation"],
    x: 550, y: 1400, from: '7', to: '11'
  },
  {
    id: '12', label: 'TikTok USDS Internship', category: 'work', status: 'completed',
    description: "Worked as an Adversary Simulation Intern at TikTok USDS where I did R&D and internal purple team engagements to improve CSOC detection capabilities.",
    gained: ['OPSEC', 'Malware Development', 'Purple Team Engagements', 'Phishing', 'Internal MacOS Application Exploitation'],
    x: 800, y: 1400, from: '9', to: '12'
  },
  {
    id: '13', label: 'Yggdrasil C2', category: 'project', status: 'in-progress',
    description: "Yggdrasil C2 is a self made command and control framework that uses Golang for performance, and the io_uring library for Linux AV/EDR evasion. It also contains various obfuscation techniques.",
    gained: ['Malware Development', 'C2 Framework Design', 'Linux AV/EDR Evasion Techniques', 'Golang', 'C Programming', 'Python'],
    x: 950, y: 1400, from: '12', to: '13'
  },
];

// {
  //   id: 'x', label: 'label', category: 'certification', status: 'completed',
  //   description: "description",
  //   gained: ['bruh1', 'bruh2'],
  //   x: 100, y: 200, from: '', to: ''
  // },

// Edges represent connections between nodes by their IDs
export const EDGES = [
  { from: '1', to: '2' },
  { from: '7', to: '3' },
  { from: '3', to: '4' },
  { from: '3', to: '5' },
  { from: '1', to: '6' },
  { from: '6', to: '7' },
  { from: '2', to: '8' },
  { from: '7', to: '9' },
  { from: '5', to: '9' },
  { from: '9', to: '10' },
  { from: '7', to: '11' },
  { from: '9', to: '12' },
  { from: '11', to: '12' },
  { from: '12', to: '13' },
];


export const ARTIFACTS: Artifact[] = [
  {
    id: 1,
    title: 'Aces',
    url: '/artifacts/1.jpeg',
    description: 'This is a photo I took during the summer after my freshman year of high school.',
    camera: 'iPhone 8',
    settings: 'ISO 40, f/1.8, 1/24s',
    rating: 4,
    tags: ['close-up', 'B&W','favorites']
  },
  {id: 2, title: 'Book', url: '/artifacts/2.jpeg', camera: 'iPhone 8', settings: 'ISO 20, f/1.8, 1/1185s', rating: 4, tags: ['close-up', 'B&W', 'favorites'], description: 'This is a photo I took during the summer after my freshman year of high school.'},
  {id: 3, title: 'Icarus', url: '/artifacts/3.jpg', camera: 'iPhone 8', settings: 'ISO 20, f/1.8, 1/1600s', rating: 5, tags: ['sunset', 'landscape', 'favorites'], description: 'Took this photo in Hawaii and is my favorite photo.'},
  {id: 4, title: 'Workaday', url: '/artifacts/4.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 32, f/2.8, 1/310s', rating: 4, tags: ['sunset', 'street'], description: 'I really liked the colors from the sky and leaves. The cars were a nice secondary subject.'},
  {id: 5, title: 'A Peace of War', url: '/artifacts/5.jpg', camera: 'N/A', settings: 'N/A', rating: 3, tags: ['photoshop', 'rule-of-thirds', 'favorites'], description: 'I made this in SnapSeed mobile. I thought it was cool to show peace made through war.'},
  {id: 6, title: 'Garden', url: '/artifacts/6.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 32, f/1.5, 1/130s', rating: 3, tags: ['nature'], description: 'Took this in Japan. I thought it had a nice natural composition.'},
  {id: 7, title: 'Casual Rich', url: '/artifacts/7.JPG', camera: 'iPhone 5c', settings: 'ISO 250, f/2.4, 1/20s', rating: 3, tags: ['street', 'night'], description: "This might've been someone's prom limo, but I thought it was funny to see a limo at an In-n-Out."},
  {id: 8, title: 'Blazing Sky', url: '/artifacts/8.jpeg', camera: 'iPhone 8', settings: 'ISO 32, f/1.8, 1/100s', rating: 3, tags: ['sunset', 'street'], description: 'I belive this was in Italy. Cool sky.'},
  {id: 9, title: 'World of Reflection', url: '/artifacts/9.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 50, f/1.5, 1/310s', rating: 3, tags: ['nature', 'landscape'], description: 'This was in Canada. I really liked the reflection from the water.'},
  {id: 10, title: 'Banff', url: '/artifacts/10.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 50, f/1.5, 1/5300s', rating: 4, tags: ['nature', 'landscape'], description: 'Banff',},
  {id: 11, title: 'Survival of the Weakest', url: '/artifacts/11.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 32, f/2.8, 1/190s', rating: 2, tags: ['nature', 'animal'], description: "I like how the squirrels are positioned. Like they're watching each others' backs."},
  {id: 12, title: 'Fortnight Lily', url: '/artifacts/12.jpeg', camera: 'iPhone 8', settings: 'ISO 20, f/1.8, 1/6098s', rating: 4, tags: ['close-up', 'rule-of-thirds', 'nature'], description: 'Took this for my photography class in highschool. I put the flower in front of the sun, but I got an unexpectedly cool background.'},
  {id: 13, title: 'Cold Night', url: '/artifacts/13.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 640, f/1.5, 1/35s', rating: 2, tags: ['snow', 'street', 'rule-of-thirds'], description: "One of the few times I've been to New York and it happened to snow that day."},
  {id: 14, title: 'Unrendered', url: '/artifacts/14.jpg', camera: 'iPhone 13 Pro', settings: 'ISO 160, f/1.5, 1/60s', rating: 3, tags: ['night', 'street'], description: "I really like how you can't see the end of the buildings. It's like the world just suddenly stops loading."},
];

// {id: 0, title: 'NAME', url: '/artifacts/1.jpeg', camera: 'iPhone 8', settings: 'ISO 40, f/1.8, 1/24s', rating: 4, tags: [''], description: "DESCRIPTION"},