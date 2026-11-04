export interface SyllabusTopic {
  id: string;
  name: string;
  importance: 'High' | 'Critical' | 'Medium';
  completed: boolean;
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  topics: SyllabusTopic[];
}

export interface SubjectSyllabus {
  id: string;
  name: string;
  code: string;
  semester: string;
  icon: string;
  units: SyllabusUnit[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  unitId: string;
  topic: string;
  question: string;
  answer: string;
  keyPoints: string[];
  teluguExplanation: string;
  mastered: boolean;
}

export interface VivaQuestion {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  expectedKeywords: string[];
  modelAnswer: string;
  examinerTrap: string;
  teluguSummary: string;
}

export const cseSubjects: SubjectSyllabus[] = [
  {
    id: 'os',
    name: 'Operating Systems',
    code: 'CS601',
    semester: 'Sem 4 / Sem 5',
    icon: 'Cpu',
    units: [
      {
        id: 'os_u1',
        unitNumber: 1,
        title: 'Process Management & CPU Scheduling',
        topics: [
          { id: 'os_t1', name: 'Process State Transitions & PCB', importance: 'High', completed: true },
          { id: 'os_t2', name: 'CPU Scheduling: FCFS, SJF, Round Robin, Multilevel Feedback', importance: 'Critical', completed: true },
          { id: 'os_t3', name: 'Thread Models & Context Switching Overhead', importance: 'Medium', completed: false }
        ]
      },
      {
        id: 'os_u2',
        unitNumber: 2,
        title: 'Synchronization & Deadlocks',
        topics: [
          { id: 'os_t4', name: 'Critical Section Problem, Mutex & Semaphores', importance: 'Critical', completed: true },
          { id: 'os_t5', name: 'Classic Problems: Producer-Consumer, Dining Philosophers', importance: 'High', completed: false },
          { id: 'os_t6', name: 'Deadlock Necessary Conditions & Banker\'s Algorithm', importance: 'Critical', completed: false }
        ]
      },
      {
        id: 'os_u3',
        unitNumber: 3,
        title: 'Memory Management & Virtual Memory',
        topics: [
          { id: 'os_t7', name: 'Paging, Segmentation & Translation Lookaside Buffer (TLB)', importance: 'Critical', completed: true },
          { id: 'os_t8', name: 'Page Replacement Algorithms: FIFO, LRU, Optimal & Belady\'s Anomaly', importance: 'Critical', completed: false },
          { id: 'os_t9', name: 'Thrashing, Working Set Model & Inverted Page Tables', importance: 'High', completed: false }
        ]
      },
      {
        id: 'os_u4',
        unitNumber: 4,
        title: 'Storage & File Systems',
        topics: [
          { id: 'os_t10', name: 'Disk Scheduling: FCFS, SCAN (Elevator), C-SCAN, LOOK', importance: 'High', completed: false },
          { id: 'os_t11', name: 'File Allocation: Contiguous, Linked, Indexed & Inodes', importance: 'High', completed: false }
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    code: 'CS502',
    semester: 'Sem 4 / Sem 5',
    icon: 'Database',
    units: [
      {
        id: 'dbms_u1',
        unitNumber: 1,
        title: 'Relational Model & ER Architecture',
        topics: [
          { id: 'dbms_t1', name: '3-Tier ANSI-SPARC Architecture & Data Independence', importance: 'High', completed: true },
          { id: 'dbms_t2', name: 'ER Modeling, Cardinality & Relational Constraints', importance: 'Medium', completed: true }
        ]
      },
      {
        id: 'dbms_u2',
        unitNumber: 2,
        title: 'Relational Calculus & Schema Normalization',
        topics: [
          { id: 'dbms_t3', name: 'Functional Dependencies & Closure of Attribute Sets', importance: 'Critical', completed: true },
          { id: 'dbms_t4', name: 'Normal Forms: 1NF, 2NF, 3NF & Boyce-Codd Normal Form (BCNF)', importance: 'Critical', completed: true },
          { id: 'dbms_t5', name: 'Lossless Join Decomposition & Dependency Preservation', importance: 'Critical', completed: false }
        ]
      },
      {
        id: 'dbms_u3',
        unitNumber: 3,
        title: 'Transactions & Concurrency Control',
        topics: [
          { id: 'dbms_t6', name: 'ACID Properties & Transaction State Diagram', importance: 'Critical', completed: true },
          { id: 'dbms_t7', name: 'Conflict vs View Serializability & Precedence Graph', importance: 'Critical', completed: false },
          { id: 'dbms_t8', name: 'Two-Phase Locking (2PL), Strict 2PL & Deadlock Detection', importance: 'Critical', completed: false }
        ]
      },
      {
        id: 'dbms_u4',
        unitNumber: 4,
        title: 'Storage Engines, B+ Trees & Query Optimization',
        topics: [
          { id: 'dbms_t9', name: 'B-Trees vs B+ Trees Indexing & Range Queries', importance: 'Critical', completed: false },
          { id: 'dbms_t10', name: 'WAL (Write-Ahead Logging) & ARIES Recovery Protocol', importance: 'High', completed: false }
        ]
      }
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    code: 'CS603',
    semester: 'Sem 5 / Sem 6',
    icon: 'Network',
    units: [
      {
        id: 'cn_u1',
        unitNumber: 1,
        title: 'Network Layers & Physical / Data Link',
        topics: [
          { id: 'cn_t1', name: 'OSI 7-Layer vs TCP/IP Protocol Architecture', importance: 'Critical', completed: true },
          { id: 'cn_t2', name: 'Framing, Error Detection CRC & Hamming Codes', importance: 'High', completed: false },
          { id: 'cn_t3', name: 'Medium Access Control: CSMA/CD & CSMA/CA', importance: 'High', completed: false }
        ]
      },
      {
        id: 'cn_u2',
        unitNumber: 2,
        title: 'Network Layer & IP Routing',
        topics: [
          { id: 'cn_t4', name: 'IPv4 vs IPv6 Header, CIDR Subnetting & Supernetting', importance: 'Critical', completed: true },
          { id: 'cn_t5', name: 'Routing Protocols: Distance Vector (RIP), Link State (OSPF) & BGP', importance: 'Critical', completed: false }
        ]
      },
      {
        id: 'cn_u3',
        unitNumber: 3,
        title: 'Transport Layer & Congestion Control',
        topics: [
          { id: 'cn_t6', name: 'TCP 3-Way Handshake & Connection Teardown (FIN-ACK)', importance: 'Critical', completed: true },
          { id: 'cn_t7', name: 'TCP Flow Control (Sliding Window) vs Congestion Control (Slow Start, AIMD, CUBIC)', importance: 'Critical', completed: false },
          { id: 'cn_t8', name: 'UDP vs TCP: Header Overhead & Real-time Streaming', importance: 'High', completed: false }
        ]
      },
      {
        id: 'cn_u4',
        unitNumber: 4,
        title: 'Application Layer & Web Protocols',
        topics: [
          { id: 'cn_t9', name: 'DNS Resolution: Recursive vs Iterative Queries', importance: 'High', completed: false },
          { id: 'cn_t10', name: 'HTTP/1.1 vs HTTP/2 (Multiplexing) vs HTTP/3 (QUIC/UDP)', importance: 'Critical', completed: false }
        ]
      }
    ]
  },
  {
    id: 'system_design',
    name: 'System Design & Distributed Systems',
    code: 'CS704',
    semester: 'Placement Focus',
    icon: 'Layers',
    units: [
      {
        id: 'sd_u1',
        unitNumber: 1,
        title: 'Scalability & Architectural Fundamentals',
        topics: [
          { id: 'sd_t1', name: 'Vertical vs Horizontal Scaling & Stateless App Tiers', importance: 'Critical', completed: true },
          { id: 'sd_t2', name: 'Load Balancing Algorithms & Consistent Hashing with Virtual Nodes', importance: 'Critical', completed: true }
        ]
      },
      {
        id: 'sd_u2',
        unitNumber: 2,
        title: 'Distributed Data Storage & Consistency',
        topics: [
          { id: 'sd_t3', name: 'CAP Theorem & PACELC Theorem Deep Dive', importance: 'Critical', completed: true },
          { id: 'sd_t4', name: 'Database Sharding, Partition Keys & Resharding Challenges', importance: 'High', completed: false },
          { id: 'sd_t5', name: 'Read Replicas, Eventual Consistency & Quorum Writes (W + R > N)', importance: 'Critical', completed: false }
        ]
      },
      {
        id: 'sd_u3',
        unitNumber: 3,
        title: 'Caching & Message Queues',
        topics: [
          { id: 'sd_t6', name: 'Cache Patterns: Cache-Aside, Write-Through, Write-Behind & Eviction Policies (LRU, LFU)', importance: 'Critical', completed: false },
          { id: 'sd_t7', name: 'Asynchronous Processing: Message Queues (Kafka, RabbitMQ) & Idempotent Consumer Patterns', importance: 'High', completed: false }
        ]
      }
    ]
  }
];

export const sampleFlashcards: Flashcard[] = [
  {
    id: 'fc_1',
    subjectId: 'os',
    unitId: 'os_u3',
    topic: 'Virtual Memory & Paging',
    question: 'What is a Page Fault and how does the OS handle it?',
    answer: 'A Page Fault is a hardware trap raised by the Memory Management Unit (MMU) when a program accesses a virtual page whose Present bit is 0 in the page table (not loaded in physical RAM).',
    keyPoints: [
      'Trap to kernel mode, saving program counter & registers.',
      'Check if memory reference is valid or an illegal segmentation fault.',
      'Find a free frame in physical RAM (evict a page using LRU if RAM is full).',
      'Issue disk I/O to read required page from swap/backing store into RAM.',
      'Update page table Present bit to 1 and resume faulted instruction.'
    ],
    teluguExplanation: 'వర్చువల్ మెమరీలో (Virtual Memory) ప్రాసెస్ కోరుకున్న పేజ్ RAM లో లేనప్పుడు MMU కలిగించే ట్రాప్‌ను "Page Fault" అంటారు. ఆపరేటింగ్ సిస్టమ్ డిస్క్ (Swap Space) నుండి ఆ పేజ్‌ను చదివి RAM లోని ఖాళీ ఫ్రేమ్‌లో ఉంచుతుంది, ఆపై ప్రాసెస్‌ను తిరిగి ప్రారంభిస్తుంది.',
    mastered: false
  },
  {
    id: 'fc_2',
    subjectId: 'os',
    unitId: 'os_u2',
    topic: 'Deadlock Necessary Conditions',
    question: 'What are the Coffman 4 necessary conditions for Deadlock?',
    answer: 'A deadlock can occur if and only if all four of these conditions hold simultaneously in the system.',
    keyPoints: [
      '1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.',
      '2. Hold and Wait: A process must hold at least one resource and wait to acquire additional resources held by others.',
      '3. No Preemption: Resources cannot be forcibly taken; they can only be released voluntarily by the holding process.',
      '4. Circular Wait: A closed chain of processes exists such that each process holds a resource needed by the next.'
    ],
    teluguExplanation: 'డెడ్‌లాక్ (Deadlock) ఏర్పడటానికి 4 షరతులు ఒకేసారి జరగాలి: 1. మ్యూచువల్ ఎక్స్‌క్లూజన్ (షేర్ చేసుకోలేని వనరులు), 2. హోల్డ్ అండ్ వెయిట్ (ఒక వనరును ఉంచుకుని ఇంకొకదాని కోసం వేచి ఉండటం), 3. నో ప్రియంప్షన్ (బలవంతంగా లాక్కోలేకపోవడం), 4. సర్క్యులర్ వెయిట్ (ఒకరిదగ్గర ఉన్నదాని కోసం మరొకరు చక్రీయంగా ఆగడం).',
    mastered: true
  },
  {
    id: 'fc_3',
    subjectId: 'dbms',
    unitId: 'dbms_u3',
    topic: 'ACID Properties',
    question: 'Explain the ACID properties of a Database Transaction.',
    answer: 'ACID defines the four fundamental guarantees required for reliable database transaction processing.',
    keyPoints: [
      'Atomicity: All-or-nothing execution. If any operation fails, the transaction is completely rolled back.',
      'Consistency: Transactions bring the database from one valid state to another, satisfying all integrity constraints.',
      'Isolation: Concurrent transactions execute without interfering with each other, as if running serially.',
      'Durability: Once committed, changes persist even in the event of sudden power loss or system crashes.'
    ],
    teluguExplanation: 'ACID లక్షణాలు డేటాబేస్ ట్రాన్సాక్షన్ల విశ్వసనీయతకు ఆధారం. Atomicity (అన్నీ జరగాలి లేదా ఏదీ జరగకూడదు), Consistency (డేటా రూల్స్ ప్రకారం స్థిరంగా ఉండాలి), Isolation (ఒకరి ట్రాన్సాక్షన్ ఇంకొకరికి అడ్డురాకూడదు), Durability (కమిట్ అయ్యాక సిస్టమ్ క్రాష్ అయినా డేటా భద్రంగా ఉంటుంది).',
    mastered: true
  },
  {
    id: 'fc_4',
    subjectId: 'dbms',
    unitId: 'dbms_u2',
    topic: 'Normalization: 3NF vs BCNF',
    question: 'What is the exact distinction between 3NF and BCNF?',
    answer: 'Every relation in BCNF is in 3NF, but not every relation in 3NF is in BCNF. BCNF eliminates all functional dependency anomalies.',
    keyPoints: [
      '3NF Rule: For every non-trivial FD X -> Y, either X is a superkey OR Y is a prime attribute (part of a candidate key).',
      'BCNF Rule: For every non-trivial FD X -> Y, X MUST strictly be a superkey (no prime attribute exception!).',
      'Decomposing into BCNF guarantees zero redundancy, but might not always preserve all functional dependencies.'
    ],
    teluguExplanation: '3NF లో X -> Y అనే నియమంలో X సూపర్ కీ అయినా కావచ్చు, లేదా Y ప్రైమ్ ఆట్రిబ్యూట్ (కాండిడేట్ కీ భాగం) అయినా సరిపోతుంది. కానీ BCNF లో కచ్చితంగా X సూపర్ కీ మాత్రమే కావాలి! కాబట్టి BCNF అనేది 3NF కన్నా కఠినమైనది.',
    mastered: false
  },
  {
    id: 'fc_5',
    subjectId: 'cn',
    unitId: 'cn_u3',
    topic: 'TCP 3-Way Handshake',
    question: 'Describe the sequence and flags of the TCP 3-Way Handshake.',
    answer: 'The TCP 3-Way Handshake establishes a synchronized, full-duplex reliable connection between client and server.',
    keyPoints: [
      'Step 1 (SYN): Client picks an Initial Sequence Number (ISN_c) and sends a segment with SYN=1, ACK=0 to server.',
      'Step 2 (SYN-ACK): Server receives SYN, allocates buffers, picks its own ISN_s, and sends SYN=1, ACK=1 with ack_num = ISN_c + 1.',
      'Step 3 (ACK): Client receives SYN-ACK and sends ACK=1 with ack_num = ISN_s + 1. Data payload may now be included.'
    ],
    teluguExplanation: 'TCP కనెక్షన్ ఏర్పాటుకు 3 దశలుంటాయి: 1. క్లయింట్ SYN ఫ్లాగ్‌తో సీక్వెన్స్ నంబర్ పంపుతుంది. 2. సర్వర్ తన సీక్వెన్స్ నంబర్‌తో పాటు SYN-ACK పంపి అంగీకరిస్తుంది. 3. క్లయింట్ ACK పంపి కన్ఫర్మ్ చేస్తుంది. దీనితో ఇరువైపులా విశ్వసనీయ డేటా బదిలీ ప్రారంభమవుతుంది.',
    mastered: false
  },
  {
    id: 'fc_6',
    subjectId: 'system_design',
    unitId: 'sd_u2',
    topic: 'CAP & PACELC Theorem',
    question: 'What does the CAP Theorem state, and how does PACELC extend it?',
    answer: 'In any distributed data store, you can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.',
    keyPoints: [
      'Since physical network partitions (P) are inevitable, distributed systems must trade off Consistency (CP) vs Availability (AP).',
      'CP Systems (e.g. HBase, MongoDB in primary-write mode): Reject reads/writes during partition to prevent split-brain stale data.',
      'AP Systems (e.g. Cassandra, DynamoDB): Accept writes on both sides during partition, reconciling via vector clocks or last-write-wins.',
      'PACELC Extension: IF Partition (P): choose Availability (A) or Consistency (C); ELSE (E): trade off Latency (L) vs Consistency (C).'
    ],
    teluguExplanation: 'CAP సిద్ధాంతం ప్రకారం ఒక డిస్ట్రిబ్యూటెడ్ నెట్‌వర్క్‌లో విభజన (Partition) వచ్చినప్పుడు Consistency (ఖచ్చితమైన డేటా) మరియు Availability (అందుబాటు) రెండింటిలో ఒకదానిని మాత్రమే ఎంచుకోగలం. PACELC దీనిని పొడిగిస్తూ, విభజన లేనప్పుడు Latency (వేగం) మరియు Consistency మధ్య రాజీ ఎలా ఉంటుందో వివరిస్తుంది.',
    mastered: true
  }
];

export const sampleVivaQuestions: VivaQuestion[] = [
  {
    id: 'vq_1',
    subjectId: 'os',
    topic: 'Virtual Memory & Thrashing',
    question: 'What is Thrashing in an operating system, and how does the OS detect and recover from it?',
    expectedKeywords: ['Page Fault Frequency', 'Degree of Multiprogramming', 'Working Set Model', 'Swap Space', 'CPU Utilization Drop'],
    modelAnswer: 'Thrashing occurs when a computer\'s virtual memory resources are oversubscribed, leading to a state where the system spends significantly more time paging data into and out of secondary storage than executing actual application instructions. \n\nAs the degree of multiprogramming increases, each process receives fewer physical frames. When processes cannot fit their working set in memory, page fault rates skyrocket. The OS interprets the resulting low CPU utilization as a sign that it needs to increase multiprogramming, bringing in more processes and worsening the problem until the system halts.\n\nThe OS detects thrashing by monitoring the Page Fault Frequency (PFF). To recover, it reduces the degree of multiprogramming by temporarily swapping out entire lower-priority processes to disk until the remaining processes have enough physical frames to satisfy their working sets.',
    examinerTrap: 'Students often say "Add more RAM" as the OS answer! Emphasize that the OS must handle thrashing in software by reducing multiprogramming and suspending processes, not waiting for physical hardware upgrades.',
    teluguSummary: 'థ్రాషింగ్ (Thrashing) అంటే ఆపరేటింగ్ సిస్టమ్ ప్రోగ్రామ్ కోడ్ రన్ చేయడం కన్నా, మెమరీ పేజీలను హార్డ్ డిస్క్ నుండి RAM లోకి మార్చడానికే (Paging) ఎక్కువ సమయం వృధా చేసే దుస్థితి. దీని వలన CPU వాడకం పడిపోతుంది. OS కొన్ని ప్రాసెస్‌లను తాత్కాలికంగా ఆపి (Swap Out) మిగిలిన వాటికి సరిపడా మెమరీ ఇచ్చి దీనిని పరిష్కరిస్తుంది.'
  },
  {
    id: 'vq_2',
    subjectId: 'dbms',
    topic: 'B+ Tree Indexing vs Hash Indexing',
    question: 'Why do relational database engines like PostgreSQL, MySQL, and SQLite use B+ Trees rather than Hash Maps as their default index structure?',
    expectedKeywords: ['Range Queries', 'Logarithmic Search O(log N)', 'Sequential Disk Reads', 'Doubly-Linked Leaf Nodes', 'Equality vs Inequality'],
    modelAnswer: 'While Hash Maps achieve O(1) average lookup time for exact equality queries (WHERE id = 42), they are completely unordered. Relational databases frequently execute range queries (WHERE age BETWEEN 20 AND 30), sorting (ORDER BY timestamp), and prefix searches (WHERE name LIKE "Ar%"). In a hash index, finding ranges requires a full table scan.\n\nB+ Trees store all actual record pointers in leaf nodes linked together in a sorted doubly-linked list. Internal nodes act purely as a multi-level index. This provides three critical benefits: \n1) O(log_B N) search time for point lookups with high fanout B (shallow depth = minimal disk I/O);\n2) Blazing fast range scans by traversing adjacent leaf pointers without backtracking up the tree;\n3) Consistent sorted ordering for pagination and indexing.',
    examinerTrap: 'Don\'t say "B+ Trees are faster than Hash Tables for everything." Acknowledge that Hash indexes are faster for pure single-key equality, but B+ Trees are chosen because databases must support ranges, sorting, and inequalities.',
    teluguSummary: 'హాష్ ఇండెక్స్‌లు కేవలం ఖచ్చితమైన ఒక విలువను వెతకడానికి మాత్రమే O(1) వేగంతో పనిచేస్తాయి. కానీ డేటాబేస్‌లలో రేంజ్ క్వెరీలు (ఉదా: వయస్సు 20 నుండి 30 మధ్య), సార్టింగ్ (ORDER BY) ఎక్కువగా ఉంటాయి. B+ ట్రీలలో ఆకులన్నీ (Leaf nodes) ఒక క్రమంలో లింక్ చేయబడి ఉంటాయి, కాబట్టి రేంజ్ క్వెరీలు మరియు డిస్క్ రీడింగ్ చాలా సమర్థవంతంగా పనిచేస్తాయి.'
  },
  {
    id: 'vq_3',
    subjectId: 'cn',
    topic: 'HTTP/2 vs HTTP/3 (QUIC)',
    question: 'Why did HTTP/3 replace TCP with QUIC over UDP, and what problem does it solve?',
    expectedKeywords: ['Head-of-Line Blocking (HoL)', 'TCP Retransmission', 'QUIC', 'UDP', '0-RTT Handshake', 'Independent Streams'],
    modelAnswer: 'HTTP/2 introduced binary multiplexing, allowing multiple HTTP requests to be sent concurrently over a single TCP connection. However, because TCP views the connection as a single linear byte stream, a single dropped packet stalls ALL concurrent HTTP streams while TCP waits for retransmission and in-order delivery. This is known as Transport-Layer Head-of-Line (HoL) Blocking.\n\nHTTP/3 solves this by replacing TCP with QUIC, a transport protocol built on top of UDP. In QUIC, independent HTTP streams are tracked separately at the transport layer. If a packet for Stream 1 is lost on the network, Stream 2 and Stream 3 continue delivering data to the application with zero delay! Additionally, QUIC merges the transport and TLS 1.3 handshakes into a single round trip (and 0-RTT for resumed connections), dramatically speeding up mobile connections.',
    examinerTrap: 'Students often claim UDP is unreliable so HTTP/3 must lose data. Clarify immediately that QUIC implements its own connection reliability, congestion control, and retransmission on top of UDP.',
    teluguSummary: 'HTTP/2 లో ఒకే TCP కనెక్షన్ లో అనేక డేటా స్ట్రీమ్స్ పంపుతారు, కానీ ఒక ప్యాకెట్ మిస్ అయినా మొత్తం అన్ని స్ట్రీమ్స్ ఆగిపోతాయి (Head-of-Line Blocking). HTTP/3 లో TCP కి బదులుగా UDP పై నిర్మించిన QUIC ప్రోటోకాల్ వాడతారు. ఇందులో ఒక స్ట్రీమ్ లో ప్యాకెట్ పోయినా మిగిలిన స్ట్రీమ్స్ ఆగకుండా రన్ అవుతాయి, కనెక్షన్ ప్రారంభ సమయం కూడా చాలా వేగంగా ఉంటుంది.'
  },
  {
    id: 'vq_4',
    subjectId: 'system_design',
    topic: 'Consistent Hashing',
    question: 'How does Consistent Hashing prevent widespread cache invalidation when servers are added or removed?',
    expectedKeywords: ['Hash Ring (0 to 2^32 - 1)', 'Virtual Nodes (Vnodes)', 'Clockwise Traversal', 'Hotspot Prevention', 'Minimal Key Remapping (K / N)'],
    modelAnswer: 'In traditional naive hashing (serverIndex = hash(key) % N), changing the server count N from 9 to 10 causes virtually 100% of all keys to map to different servers, resulting in a catastrophic cache stampede that overwhelms backend databases.\n\nConsistent Hashing maps both servers and keys onto a circular ring of values (e.g. 0 to 2^32 - 1). A key is assigned to the first server whose position on the ring is greater than or equal to the key\'s position in a clockwise direction.\n\nWhen a server is added or removed, only keys between that server and its immediate counter-clockwise neighbor are moved (on average only K/N keys are remapped). To prevent non-uniform distribution (hotspots), each physical server is mapped to hundreds of "Virtual Nodes" (vnodes) scattered randomly across the ring.',
    examinerTrap: 'Remember to mention "Virtual Nodes"! Without virtual nodes, consistent hashing can cause severe server load imbalances because physical servers may land unevenly on the ring.',
    teluguSummary: 'సాధారణ హ్యాషింగ్ (hash(key) % N) లో సర్వర్ల సంఖ్య మారితే దాదాపు అన్ని కీలు మారిపోయి క్యాష్ మొత్తం ఖాళీ అవుతుంది. కన్సిస్టెంట్ హ్యాషింగ్ లో సర్వర్లు మరియు కీలను ఒక గుండ్రని వలయంలా (Ring) భావిస్తారు. ఒక సర్వర్ పెరిగినా లేదా తగ్గినా కేవలం దానికి సంబంధించిన కొన్ని కీలు మాత్రమే మారుతాయి (K/N), మిగిలిన మొత్తం క్యాష్ చెక్కుచెదరకుండా ఉంటుంది.'
  }
];

export function getSubjects(): SubjectSyllabus[] {
  return cseSubjects;
}

export function getSubjectById(subjectId: string): SubjectSyllabus | undefined {
  return cseSubjects.find(s => s.id === subjectId);
}

export function getFlashcards(subjectId?: string): Flashcard[] {
  if (!subjectId || subjectId === 'all') return sampleFlashcards;
  return sampleFlashcards.filter(f => f.subjectId === subjectId);
}

export function getVivaQuestions(subjectId?: string): VivaQuestion[] {
  if (!subjectId || subjectId === 'all') return sampleVivaQuestions;
  return sampleVivaQuestions.filter(q => q.subjectId === subjectId);
}

export function calculateProgress(masteredCardIds: string[], subjectFilter?: string): {
  totalCount: number;
  masteredCount: number;
  percentage: number;
} {
  const cards = getFlashcards(subjectFilter);
  const totalCount = cards.length;
  if (totalCount === 0) return { totalCount: 0, masteredCount: 0, percentage: 0 };
  const masteredCount = cards.filter(c => masteredCardIds.includes(c.id)).length;
  const percentage = Math.round((masteredCount / totalCount) * 100);
  return { totalCount, masteredCount, percentage };
}

export function calculateSyllabusProgress(completedTopicIds: string[], subjectId: string): {
  totalTopics: number;
  completedCount: number;
  percentage: number;
} {
  const subject = getSubjectById(subjectId);
  if (!subject) return { totalTopics: 0, completedCount: 0, percentage: 0 };
  const allTopics = subject.units.flatMap(u => u.topics);
  const totalTopics = allTopics.length;
  if (totalTopics === 0) return { totalTopics: 0, completedCount: 0, percentage: 0 };
  const completedCount = allTopics.filter(t => completedTopicIds.includes(t.id)).length;
  const percentage = Math.round((completedCount / totalTopics) * 100);
  return { totalTopics, completedCount, percentage };
}

export function exportRevisionNotesMarkdown(
  subjectId: string,
  customFlashcards?: Flashcard[],
  completedTopicIds?: string[]
): string {
  const subject = getSubjectById(subjectId);
  const standardFlashcards = getFlashcards(subjectId);
  const allFlashcards = customFlashcards && customFlashcards.length > 0
    ? [...standardFlashcards, ...customFlashcards.filter(c => c.subjectId === subjectId)]
    : standardFlashcards;
  const viva = getVivaQuestions(subjectId);

  return `# Complete Revision & Viva Voce Guide: ${subject?.name || 'Computer Science Engineering'}
Subject Code: ${subject?.code || 'CSE'} | Generated by StudySignal (Product 04 • Wave B)

---

## 📚 Core Syllabus Overview
${(subject?.units || []).map(u => `### Unit ${u.unitNumber}: ${u.title}
${u.topics.map(t => `- [${(completedTopicIds ? completedTopicIds.includes(t.id) : t.completed) ? 'x' : ' '}] **${t.name}** (${t.importance} Priority)`).join('\n')}
`).join('\n')}

---

## ⚡ Active Recall Revision Cards
${allFlashcards.map((f, i) => `### Card ${i + 1}: ${f.topic}
**Q: ${f.question}**  
*Key Takeaway*: ${f.answer}

**Critical Examination Points**:
${f.keyPoints.map(kp => `- ${kp}`).join('\n')}

> **Telugu Concept Summary**:
> ${f.teluguExplanation}
`).join('\n')}

---

## 🎯 Viva Simulator & Technical Interview Questions
${viva.map((v, i) => `### Question ${i + 1}: ${v.question}
- **Expected Key Concepts**: ${v.expectedKeywords.join(', ')}
- **Model Answer**:
${v.modelAnswer}

- **Examiner Trap / Warning**:
*${v.examinerTrap}*
`).join('\n')}
`;
}
