/* ---------- GCSE Computer Science ---------- */
EQ('gcs1-1','Data in a computer','',[
 ['n','Convert the binary number 10110110 to denary.',182,0,'',2,'128 + 32 + 16 + 4 + 2 = 182.'],
 ['n','How many bytes are in 2 kilobytes? (1 KB = 1000 bytes)',2000,0,'bytes',1,'2 × 1000 = 2000 bytes.'],
 ['c','What does the CPU do over and over?',['Fetch, decode, execute','Input, output, store','Save, load, delete','Compile, link, run'],1,'The fetch–decode–execute cycle.']]);
EQ('gcs1-2','Thinking like a programmer','',[
 ['c','Which of these is an example of iteration?',['A FOR loop','An IF statement','A variable assignment','A print statement'],1,'Iteration means repeating: loops.'],
 ['s','Explain what decomposition means in computational thinking.',2,['Breaking a problem down into smaller sub-problems','Each smaller part is easier to understand and solve']]]);
EQ('gcs2-1','Searching and sorting','',[
 ['n','In the worst case, how many comparisons does a linear search make on a list of 50 items?',50,0,'',1,'It may have to check every item.'],
 ['c','About how many comparisons does a binary search need at most for 1000 sorted items?',['10','500','1000','100'],1,'Each comparison halves the list: 2¹⁰ = 1024, so about 10.'],
 ['s','Explain why a binary search only works on sorted data.',2,['It compares with the middle item and discards half the list','That only works if you know which half the target must be in, i.e. the data is in order']]]);
EQ('gcs2-2','Programming','',[
 ['n','What is 17 MOD 5?',2,0,'',1,'17 = 3 × 5 + 2, so the remainder is 2.'],
 ['n','What is 17 DIV 5?',3,0,'',1,'Integer division: 17 ÷ 5 = 3 remainder 2.'],
 ['s','Give two benefits of using subroutines.',2,['Code can be reused without rewriting it','Programs are easier to test and debug in small parts','Programs are easier to read and maintain','Different people can work on different subroutines']]]);
EQ('gcs2-3','Data representation','',[
 ['n','Convert the hexadecimal number 2F to denary.',47,0,'',2,'2 × 16 + 15 = 47.'],
 ['n','Add the binary numbers 0101 and 0011. Give the answer in denary.',8,0,'',1,'0101 + 0011 = 1000 = 8.'],
 ['c','Why is Unicode used instead of ASCII?',['It can represent far more characters, including other languages and emoji','It uses fewer bits per character','It is faster to type','It only stores numbers'],1,'ASCII has 128 (or 256) characters; Unicode has over a million code points.']]);
EQ('gcs2-4','Logic and the CPU','',[
 ['c','What is the output of an AND gate with inputs 1 and 0?',['0','1','2','It depends on the clock'],1,'AND only outputs 1 when both inputs are 1.'],
 ['c','Which register holds the address of the next instruction?',['Program counter','Accumulator','MDR','ALU'],1,'The program counter (PC) points to the next instruction.'],
 ['s','Explain two differences between RAM and ROM.',2,['RAM is volatile (loses its contents without power); ROM is non-volatile','RAM can be read and written and holds running programs; ROM is read-only and holds the start-up (boot) instructions']]]);
EQ('gcs3-1','Images and sound','',[
 ['n','An image is 100 × 100 pixels with 8 bits per pixel. What is its file size in bytes?',10000,0,'bytes',2,'100 × 100 × 8 = 80 000 bits = 10 000 bytes.'],
 ['n','A mono sound is sampled at 44 100 Hz with 16 bits per sample for 10 seconds. What is its size in bytes?',882000,0,'bytes',2,'44 100 × 16 × 10 = 7 056 000 bits = 882 000 bytes.'],
 ['c','Which of these is a lossless compression method?',['Run-length encoding','Removing sounds people can\'t hear','Reducing the colour depth','Lowering the sample rate'],1,'RLE stores runs of repeated data without throwing any information away.']]);
EQ('gcs3-2','Networks','',[
 ['c','Which protocol is used for secure web pages?',['HTTPS','FTP','SMTP','POP'],1,'HTTPS encrypts web traffic.'],
 ['c','Which layer of the TCP/IP model does IP belong to?',['Internet (network) layer','Application layer','Transport layer','Link layer'],1,'IP handles addressing and routing packets between networks.'],
 ['s','Give two advantages of a star network.',2,['If one cable fails, only that device is affected','It is easy to add new devices','Fast, with few data collisions because each device has its own link']]]);
EQ('gcs3-3','Cyber security','',[
 ['c','An email pretends to be from your bank and asks for your password. What is this?',['Phishing','A brute-force attack','A DDoS attack','SQL injection'],1,'Phishing tricks people into giving away details.'],
 ['s','Give two ways to protect an account against a brute-force attack.',2,['Use strong, long passwords','Lock the account after several failed attempts','Use two-factor authentication','Use CAPTCHAs or delays between attempts']]]);
EQ('gcs3-4','Databases and SQL','A table called students has fields name and age.',[
 ['c','Which SQL query lists the names of students older than 16?',['SELECT name FROM students WHERE age > 16','SELECT students FROM name WHERE age > 16','GET name FROM students IF age > 16','SELECT * WHERE age > 16'],1,'SELECT field FROM table WHERE condition.'],
 ['s','Explain what a primary key is.',2,['A field whose value is unique for each record','It is used to identify each record (and to link tables)']]]);
EQ('gcs3-5','Robust programs','',[
 ['c','Which is an example of a range check?',['Age must be between 0 and 120','A postcode must have a space','A field must not be empty','A password must be typed twice'],1,'A range check tests that a value falls between limits.'],
 ['s','Explain the difference between iterative testing and final testing.',2,['Iterative testing happens during development, testing each part as it is written','Final (terminal) testing happens at the end, testing the whole program']]]);
EQ('gcs4-1','Exam problem solving','x = 3. REPEAT x = x × 2 UNTIL x > 20. OUTPUT x',[
 ['n','What is output?',24,0,'',2,'3 → 6 → 12 → 24. 24 > 20, so it stops and outputs 24.'],
 ['n','How many different values can 4 bits represent?',16,0,'',1,'2⁴ = 16.'],
 ['c','What is NOT (A OR B) when A = 0 and B = 0?',['1','0','2','Undefined'],1,'A OR B = 0, so NOT gives 1.']]);
EQ('gcs5-1','Huffman coding','In some text, the letter E appears 12 times and has the Huffman code 0. The letter Z appears once and has the code 11010.',[
 ['n','How many bits are used to store all the Es?',12,0,'bits',1,'12 × 1 bit = 12 bits.'],
 ['n','In 8-bit ASCII, how many bits would the 12 Es take?',96,0,'bits',1,'12 × 8 = 96 bits.'],
 ['s','Explain why Huffman coding usually makes a file smaller.',3,['Frequent characters get short codes','Rare characters get longer codes','So the total number of bits is lower than with fixed-length codes like ASCII']]]);
