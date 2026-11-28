/* ========== GCSE COMPUTER SCIENCE (AQA 8525) ========== */
GLV.gcs=[null,['Getting started','The basics everything else builds on: what computers do, binary, and how to think like a programmer.'],['Year 10','AQA GCSE Computer Science Year 10 topics: algorithms, programming, data representation and computer systems.'],['Year 11','AQA GCSE Computer Science Year 11 topics: images, sound and compression, networks, cyber security, databases and SQL, robust programs and the law.'],['Grade 7–8','Exam-style problem solving: tracing code, calculations and logic circuits, the way Papers 1 and 2 test them.'],['Grade 9','The hardest questions: Huffman trees, SQL across two tables, writing algorithms and extended answers.']];
GOALS.gcs1={icon:'💡',title:'Get the basics',story:'Two short units: how computers handle data, and how programmers break problems down.',final:'Ready for GCSE Computer Science',steps:['Computers and data','Thinking like a programmer']};
GOALS.gcs2={icon:'💻',title:'Master Year 10 computer science',story:'Each unit is one strand of the AQA course. Finish all four and you\'ve covered the Year 10 content.',final:'Year 10 computer science complete',steps:['Algorithms','Programming','Data representation','Computer systems']};
GOALS.gcs3={icon:'🌐',title:'Master Year 11 computer science',story:'The rest of the course: from compressing images to keeping networks secure.',final:'Year 11 computer science complete',steps:['Images, sound and compression','Networks','Cyber security','Databases and SQL','Robust programs and the law']};
GOALS.gcs4={icon:'🎯',title:'Reach grade 7–8 in computer science',story:'The kind of multi-step questions that separate a 6 from an 8.',final:'Grade 7–8 standard',steps:['Exam problem solving']};
GOALS.gcs5={icon:'🏆',title:'Go for a grade 9 in computer science',story:'The hardest things AQA asks. Get these and nothing in the exam can surprise you.',final:'Grade 9 standard',steps:['Grade 9 challenges']};

/* ----- Level 1: getting started ----- */
U({id:'gcs1-1',track:'gcs',level:1,title:'Computers and data',icon:'01',color:'#1f8fb3',desc:'What a computer actually does, and why everything inside it is stored as 0s and 1s.',lessons:[
LH('gcs1-1-1','What a computer does',7,'Input, process, output and storage: the four jobs of every computer, from a phone to the control room.',[
T(`<h3>A computer has four jobs</h3><ul><li><b>Input</b>: data comes in (keyboard, mouse, sensors, a microphone)</li><li><b>Process</b>: the CPU works on it</li><li><b>Output</b>: results go out (screen, speakers, a motor)</li><li><b>Storage</b>: data is kept for later (an SSD, a hard disk)</li></ul><p>A reactor control system works the same way: sensors are inputs, the computer processes them, and alarms and displays are outputs.</p>`),
W('sortIt',{bins:['Input','Output','Storage'],items:[['Keyboard',0],['Temperature sensor',0],['Microphone',0],['Monitor',1],['Speaker',1],['Printer',1],['Solid state drive',2],['USB flash drive',2]]},`Sort each device by its job.`,`Inputs bring data in, outputs send results out, storage keeps data.`),
T(`<h3>Hardware and software</h3><p><b>Hardware</b> is the physical parts you can touch: the CPU, memory, the screen.</p><p><b>Software</b> is the programs that run on it. There are two kinds:</p><ul><li><b>System software</b> runs the computer itself, like the operating system (Windows, Android).</li><li><b>Application software</b> does a job for you, like a browser, a game or Critical.</li></ul>`),
Q(`Which of these is system software?`,[`An operating system`,`A web browser`,`A photo editor`,`A word processor`],0,`The operating system manages the hardware. The others do tasks for the user, so they're application software.`),
Q(`A thermostat reads the temperature and switches a heater on. The temperature sensor is…`,[`an input`,`an output`,`storage`,`software`],0,`It sends data into the system.`),
T(`<h3>Embedded systems</h3><p>An <b>embedded system</b> is a computer built into a bigger device to do one job: a washing machine controller, a car's engine management, a smart meter. They're usually small, cheap and very reliable, and you can't install new apps on them.</p>`),
Q(`Which is an embedded system?`,[`The computer controlling a washing machine`,`A gaming laptop`,`A school desktop PC`,`A tablet`],0,`It does one dedicated job inside a bigger machine.`)]),
LH('gcs1-1-2','Bits and bytes',7,'Why computers use only two digits, and the names for groups of them.',[
T(`<h3>Why binary?</h3><p>Inside a computer, everything is stored using switches (transistors) that are either <b>on</b> or <b>off</b>. That gives two states, written <b>1</b> and <b>0</b>.</p><p>A number system with only two digits is called <b>binary</b>. Each binary digit is a <b>bit</b>.</p>`),
T(`<h3>Groups of bits</h3><ul><li><b>Bit</b>: one binary digit, 0 or 1</li><li><b>Nibble</b>: 4 bits</li><li><b>Byte</b>: 8 bits</li></ul><p>Text, pictures, sound and programs are all stored as patterns of bits.</p>`),
Q(`How many bits are in a byte?`,[`8`,`4`,`2`,`16`],0,`A byte is 8 bits. Half a byte (4 bits) is a nibble.`),
N(`How many bits are in 3 bytes?`,24,0.001,'bits',`3 × 8 = 24 bits.`),
T(`<h3>How many patterns?</h3><p>With n bits you can make <b>2<sup>n</sup></b> different patterns.</p><ul><li>1 bit: 2 patterns (0, 1)</li><li>2 bits: 4 patterns (00, 01, 10, 11)</li><li>8 bits: 2<sup>8</sup> = 256 patterns</li></ul>`),
N(`How many different patterns can 4 bits make?`,16,0.001,'',`2<sup>4</sup> = 16.`),
Q(`Why do computers use binary?`,[`Their switches have two states: on and off`,`Binary numbers are shorter`,`It's easier for humans to read`,`It uses less electricity than decimal`],0,`Transistors are either on or off, so two digits are all they need.`)]),
LH('gcs1-1-3','Counting in binary',8,'Read and write binary numbers using place values.',[
T(`<h3>Place values</h3><p>In denary (normal numbers) each column is worth 10 times the one to its right: 1, 10, 100…</p><p>In binary each column is worth <b>2 times</b> the one to its right:</p><div class="eq">128 · 64 · 32 · 16 · 8 · 4 · 2 · 1</div><p>To read a binary number, add up the place values where there's a 1.</p>`),
T(`<h3>Example</h3><p><b>0010 1101</b>: the 1s are under 32, 8, 4 and 1.</p><p>32 + 8 + 4 + 1 = <b>45</b>.</p>`),
N(`Convert the binary number 1011 to denary.`,11,0.001,'',`8 + 2 + 1 = 11.`),
N(`Convert 0110 0100 to denary.`,100,0.001,'',`64 + 32 + 4 = 100.`),
T(`<h3>Denary to binary</h3><p>Start at the biggest place value that fits, and subtract as you go.</p><p>To write <b>37</b>: 32 fits (5 left), 16 no, 8 no, 4 fits (1 left), 2 no, 1 fits. So 37 = <b>0010 0101</b>.</p>`),
Q(`What is 19 in 8-bit binary?`,[`0001 0011`,`0001 1001`,`0010 0011`,`0000 1011`],0,`16 + 2 + 1 = 19.`),
N(`What's the largest number you can store in 8 bits?`,255,0.001,'',`1111 1111 = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.`)])]});
U({id:'gcs1-2',track:'gcs',level:1,title:'Thinking like a programmer',icon:'{ }',color:'#534AB7',desc:'Algorithms, decomposition and abstraction, and the three building blocks of every program.',lessons:[
LH('gcs1-2-1','Algorithms',7,'An algorithm is a precise set of steps that solves a problem. Every program starts as one.',[
T(`<h3>What is an algorithm?</h3><p>An <b>algorithm</b> is a sequence of steps that can be followed to complete a task. A recipe is an algorithm. So is a reactor start-up procedure.</p><p>A <b>program</b> is an algorithm written in a language a computer can run.</p>`),
T(`<h3>Two key skills</h3><ul><li><b>Decomposition</b>: breaking a problem into smaller problems that are easier to solve.</li><li><b>Abstraction</b>: removing unnecessary detail so you can focus on what matters.</li></ul><p>A Tube map is an abstraction: it leaves out real distances because you only need the order of stops.</p>`),
Q(`Splitting "make a game" into "draw the screen", "move the player" and "keep score" is…`,[`decomposition`,`abstraction`,`iteration`,`selection`],0,`Breaking a big problem into smaller ones is decomposition.`),
Q(`A control room display shows "Tavg 307 °C" but hides the readings from each individual sensor. That's…`,[`abstraction`,`decomposition`,`a bug`,`an algorithm`],0,`It removes detail the operator doesn't need right now.`),
O(`Put this algorithm for making toast in a sensible order.`,['Put bread in the toaster','Switch it on','Wait until it pops up','Take the toast out','Butter it'],`Algorithms need their steps in the right order.`),
Q(`What makes a good algorithm?`,[`Precise, unambiguous steps in the right order`,`As few words as possible`,`Written in Python`,`It only works for one input`],0,`Anyone (or any computer) following it should get the same result.`)]),
LH('gcs1-2-2','Sequence, selection and iteration',8,'Every program is built from just three structures.',[
T(`<h3>The three building blocks</h3><ul><li><b>Sequence</b>: steps run one after another, in order.</li><li><b>Selection</b>: a decision chooses which steps run (IF…THEN…ELSE).</li><li><b>Iteration</b>: steps repeat (a loop).</li></ul>`),
T(`<h3>In AQA pseudo-code</h3><pre class="cs">temp ← USERINPUT
IF temp &gt; 320 THEN
   OUTPUT 'ALARM'
ELSE
   OUTPUT 'Normal'
ENDIF</pre><p>The arrow <b>←</b> means "store this value in the variable". That's assignment.</p>`),
W('sortIt',{bins:['Sequence','Selection','Iteration'],items:[['Do these three steps in order',0],['Read a number, then print it',0],['IF it\'s raining THEN take a coat',1],['Choose a menu option and act on it',1],['Repeat until the user types "quit"',2],['FOR each item in the list',2]]},`Which structure is each one?`,`Order = sequence, decisions = selection, repeating = iteration.`),
Q(`A loop that runs a fixed number of times, like FOR i ← 1 TO 10, is called…`,[`definite iteration`,`indefinite iteration`,`selection`,`sequence`],0,`You know how many times it runs. A WHILE loop that runs until something happens is indefinite iteration.`),
Q(`Which structure is a WHILE loop?`,[`Iteration`,`Selection`,`Sequence`,`Decomposition`],0,`It repeats while a condition is true.`),
T(`<h3>Flowcharts</h3><ul><li><b>Rounded box</b>: start or end</li><li><b>Parallelogram</b>: input or output</li><li><b>Rectangle</b>: a process</li><li><b>Diamond</b>: a decision (yes or no)</li></ul>`),
Q(`In a flowchart, which shape means a decision?`,[`Diamond`,`Rectangle`,`Parallelogram`,`Rounded box`],0,`A decision has two exits: yes and no.`)]),
LH('gcs1-2-3','Variables and inputs',7,'Programs remember things in variables. Meet them, and the difference between a variable and a constant.',[
T(`<h3>Variables</h3><p>A <b>variable</b> is a named location in memory that stores a value. The value can change while the program runs.</p><pre class="cs">score ← 0
score ← score + 10</pre><p>After this, score holds 10.</p>`),
T(`<h3>Constants</h3><p>A <b>constant</b> is a named value that <b>can't</b> change while the program runs, like <code>MAX_TEMP ← 320</code>.</p><p>Using a constant means you only change it in one place, and the code is easier to read.</p>`),
N(`x ← 5, then x ← x * 2, then x ← x + 3. What is x?`,13,0.001,'',`5 × 2 = 10, then 10 + 3 = 13.`),
Q(`Why use a constant for VAT_RATE instead of typing 0.2 everywhere?`,[`If it changes, you only update it in one place`,`Constants run faster`,`Variables can't store decimals`,`It uses less storage`],0,`It also makes the code clearer to read.`),
Q(`What does USERINPUT do in AQA pseudo-code?`,[`Gets a value typed by the user`,`Prints a value`,`Repeats a step`,`Makes a decision`],0,`OUTPUT shows a value; USERINPUT reads one in.`),
Q(`A variable called total starts at 0. A loop adds 5 to it 4 times. What's its final value?`,[`20`,`5`,`9`,`4`],0,`0 + 5 + 5 + 5 + 5 = 20.`)])]});
/* ----- Level 2: Year 10 ----- */
U({id:'gcs2-1',track:'gcs',level:2,title:'Algorithms',icon:'⇅',color:'#534AB7',desc:'Searching and sorting algorithms, efficiency and trace tables: AQA 3.1.',lessons:[
LH('gcs2-1-1','Linear and binary search',9,'Two ways to find something in a list, and why one is much faster.',[
T(`<h3>Linear search</h3><p>Check each item in turn, from the start, until you find it or reach the end.</p><ul><li>Works on <b>any</b> list, sorted or not.</li><li>Slow for long lists: in the worst case it checks every item.</li></ul>`),
T(`<h3>Binary search</h3><p>Only works on a <b>sorted</b> list.</p><ol><li>Look at the middle item.</li><li>If it's the one you want, stop.</li><li>If what you want is smaller, throw away the top half; if bigger, throw away the bottom half.</li><li>Repeat on the half that's left.</li></ol><p>Each check halves the list, so it's very fast for big lists.</p>`),
Q(`Which search needs the list to be sorted first?`,[`Binary search`,`Linear search`,`Both`,`Neither`],0,`Throwing away half the list only works if it's in order.`),
Q(`Binary search for 23 in [3, 8, 12, 17, 23, 31, 40]. What's the first item checked?`,[`17`,`3`,`23`,`40`],0,`The middle of 7 items is the 4th: 17. 23 is bigger, so the bottom half goes.`),
N(`A sorted list has 1,000 items. Roughly how many checks does a binary search need at most? (Round up: 2¹⁰ = 1,024.)`,10,0.001,'checks',`Each check halves the list. 1,000 → 500 → 250 → … about 10 checks. A linear search could need 1,000.`),
Q(`When might a linear search be the better choice?`,[`The list is short or unsorted`,`The list is huge and sorted`,`Never`,`When you need the fastest search for big data`],0,`Sorting first takes time, so for a short or unsorted list a linear search is simpler.`)]),
LH('gcs2-1-2','Bubble sort and merge sort',10,'Two sorting algorithms AQA expects you to know step by step.',[
T(`<h3>Bubble sort</h3><ol><li>Compare the first two items. If they're in the wrong order, swap them.</li><li>Move along one and compare the next pair. Keep going to the end: that's one <b>pass</b>.</li><li>Repeat passes until a whole pass makes no swaps.</li></ol><p>After each pass, the biggest unsorted item has "bubbled" to the end.</p>`),
Q(`One pass of bubble sort on [5, 2, 4, 1]. What's the list after the first pass?`,[`[2, 4, 1, 5]`,`[1, 2, 4, 5]`,`[2, 5, 1, 4]`,`[5, 4, 2, 1]`],0,`5↔2 → [2,5,4,1]; 5↔4 → [2,4,5,1]; 5↔1 → [2,4,1,5].`),
T(`<h3>Merge sort</h3><ol><li>Split the list in half again and again until every sub-list has one item.</li><li>Merge pairs of sub-lists back together, putting the items in order as you merge.</li><li>Keep merging until there's one sorted list.</li></ol>`),
Q(`What's the first stage of a merge sort?`,[`Split the list until each part has one item`,`Swap the first two items`,`Find the middle item`,`Compare every item with the last one`],0,`Then the single items are merged back in order.`),
T(`<h3>Comparing them</h3><ul><li><b>Bubble sort</b>: simple to code, sorts in place (no extra memory), but very slow for long lists.</li><li><b>Merge sort</b>: much faster for long lists, but more complex and needs extra memory for the sub-lists.</li></ul>`),
Q(`Why might you choose bubble sort over merge sort?`,[`It's simpler and uses less memory`,`It's faster for huge lists`,`It doesn't need comparisons`,`It works on unsorted lists only`],0,`For short lists the speed difference doesn't matter, and it's easier to write.`)]),
LH('gcs2-1-3','Trace tables',9,'Follow an algorithm line by line to find out what it does, or find the bug.',[
T(`<h3>What's a trace table?</h3><p>A trace table has a column for each variable. You work through the algorithm one line at a time and write down every new value.</p><pre class="cs">total ← 0
FOR i ← 1 TO 4
   total ← total + i
ENDFOR
OUTPUT total</pre><p>i goes 1, 2, 3, 4 and total goes 1, 3, 6, 10. It outputs <b>10</b>.</p>`),
N(`<pre class="cs">x ← 2
FOR i ← 1 TO 3
   x ← x * 2
ENDFOR
OUTPUT x</pre>What's output?`,16,0.001,'',`2 → 4 → 8 → 16.`),
N(`<pre class="cs">n ← 0
count ← 0
WHILE n &lt; 20
   n ← n + 6
   count ← count + 1
ENDWHILE
OUTPUT count</pre>What's output?`,4,0.001,'',`n goes 6, 12, 18, 24. The loop runs 4 times.`),
T(`<h3>DIV and MOD</h3><ul><li><b>DIV</b> gives the whole-number part of a division: 17 DIV 5 = 3.</li><li><b>MOD</b> gives the remainder: 17 MOD 5 = 2.</li></ul><p>MOD is useful for checking if a number is even: n MOD 2 = 0.</p>`),
N(`What's 29 MOD 4?`,1,0.001,'',`29 = 7 × 4 + 1, so the remainder is 1.`),
N(`What's 29 DIV 4?`,7,0.001,'',`29 ÷ 4 = 7.25, and DIV keeps the whole number: 7.`)]),
LH('gcs2-1-4','Efficiency and representing algorithms',8,'Flowcharts, pseudo-code and how to judge which algorithm is better.',[
T(`<h3>Three ways to write an algorithm</h3><ul><li><b>In words</b>: easy to read, but can be vague.</li><li><b>Flowchart</b>: shows the flow and decisions visually.</li><li><b>Pseudo-code</b>: structured like code, but not tied to one language. AQA has its own style.</li></ul>`),
T(`<h3>Efficiency</h3><p>Two algorithms can solve the same problem, but one may need far fewer steps. For GCSE you compare <b>time efficiency</b>: how the number of steps grows as the input gets bigger.</p><p>Doubling a list doubles the work for a linear search, but adds only <b>one</b> step to a binary search.</p>`),
Q(`What is pseudo-code?`,[`A way of writing an algorithm that looks like code but isn't a real language`,`A programming language`,`Machine code`,`A type of flowchart`],0,`It's for planning, so you don't worry about exact syntax.`),
Q(`A list doubles from 500 to 1,000 items. What happens to the worst case for a binary search?`,[`It needs one more check`,`It needs twice as many checks`,`It needs 500 more checks`,`Nothing`],0,`One extra halving covers the doubled list.`),
Q(`An algorithm's job is to find the highest score in a list. Which is its input?`,[`The list of scores`,`The highest score`,`The loop`,`The screen`],0,`Input: the list. Process: compare. Output: the highest score.`),
Q(`What does a parallelogram mean in a flowchart?`,[`Input or output`,`A decision`,`A process`,`Start or end`],0,`Decision = diamond, process = rectangle, start/end = rounded box.`)])]});
U({id:'gcs2-2',track:'gcs',level:2,title:'Programming',icon:'</>',color:'#1D9E75',desc:'Data types, operators, selection, iteration, arrays, strings and subroutines: AQA 3.2.',lessons:[
LH('gcs2-2-1','Data types and operators',9,'Every value has a type, and every type has rules.',[
T(`<h3>The five data types</h3><ul><li><b>Integer</b>: whole numbers, like 42 or −7</li><li><b>Real</b> (float): numbers with decimals, like 3.14</li><li><b>Boolean</b>: True or False</li><li><b>Character</b>: one letter, digit or symbol</li><li><b>String</b>: text, a sequence of characters</li></ul>`),
W('sortIt',{bins:['Integer','Real','Boolean','String'],items:[['Number of lessons done: 12',0],['Year: 2028',0],['Coolant temperature: 307.4',1],['Price: 2.99',1],['Alarm active?',2],['Is the door locked?',2],['Name: "Sunny"',3],['Postcode: "TA5 1UD"',3]]},`Pick the best data type for each.`,`A postcode is a string even though it has digits: you never do maths with it.`),
T(`<h3>Operators</h3><p><b>Arithmetic</b>: + − * / plus DIV and MOD.<br><b>Relational</b> (comparisons): = ≠ &lt; &gt; ≤ ≥. They give True or False.<br><b>Boolean</b>: AND, OR, NOT.</p>`),
Q(`temp ← 330 and pumps ← True. What's (temp &gt; 320) AND NOT pumps?`,[`False`,`True`,`330`,`An error`],0,`temp &gt; 320 is True, NOT pumps is False. True AND False = False.`),
Q(`Why store a phone number as a string, not an integer?`,[`It can start with 0 and you never do maths with it`,`Strings are faster`,`Integers can't be 11 digits`,`It saves memory`],0,`An integer would lose the leading 0.`),
Q(`What's the data type of the result of 7 &gt; 3?`,[`Boolean`,`Integer`,`Real`,`String`],0,`Comparisons always give True or False.`)]),
LH('gcs2-2-2','Selection and iteration in code',9,'IF, ELSE IF, WHILE, REPEAT and FOR, and when to use each.',[
T(`<h3>Nested selection</h3><pre class="cs">IF temp &gt; 320 THEN
   OUTPUT 'HIGH'
ELSE IF temp &lt; 280 THEN
   OUTPUT 'LOW'
ELSE
   OUTPUT 'Normal'
ENDIF</pre>`),
Q(`With the code above, what's output when temp is 320?`,[`Normal`,`HIGH`,`LOW`,`Nothing`],0,`320 isn't greater than 320, and it isn't less than 280.`),
T(`<h3>Three kinds of loop</h3><ul><li><b>FOR</b>: count-controlled (definite). Runs a set number of times.</li><li><b>WHILE</b>: condition checked <b>before</b> each run. Might run zero times.</li><li><b>REPEAT…UNTIL</b>: condition checked <b>after</b> each run. Always runs at least once.</li></ul>`),
Q(`You want to keep asking for a password until it's correct. Which loop fits best?`,[`REPEAT…UNTIL (it must ask at least once)`,`FOR i ← 1 TO 10`,`IF…THEN`,`No loop is needed`],0,`You always need to ask once, then check.`),
N(`<pre class="cs">count ← 0
FOR i ← 3 TO 9
   count ← count + 1
ENDFOR</pre>What's count at the end?`,7,0.001,'',`3, 4, 5, 6, 7, 8, 9: in AQA pseudo-code FOR includes both ends, so it runs 7 times.`),
Q(`A WHILE loop's condition is False at the start. How many times does it run?`,[`0`,`1`,`Forever`,`It depends on the code inside`],0,`WHILE checks before running, so it skips straight past.`)]),
LH('gcs2-2-3','Arrays, records and strings',9,'Storing lots of values together, and working with text.',[
T(`<h3>Arrays</h3><p>An <b>array</b> stores many values of the <b>same type</b> under one name. Each has an index, starting at <b>0</b>.</p><pre class="cs">temps ← [301, 305, 299, 310]
OUTPUT temps[2]</pre><p>Outputs <b>299</b>. A 2D array is like a table: grid[row][column].</p>`),
N(`names ← ['Ali', 'Ben', 'Cara', 'Dev']. What index is 'Dev' at?`,3,0.001,'',`Ali 0, Ben 1, Cara 2, Dev 3.`),
T(`<h3>Records</h3><p>A <b>record</b> groups related values of <b>different types</b>, each in a named field:</p><pre class="cs">RECORD Pump
   id : String
   running : Boolean
   flow : Real
ENDRECORD</pre>`),
Q(`What's the main difference between an array and a record?`,[`A record's fields can be different types`,`Arrays can only hold numbers`,`Records start at index 1`,`There's no difference`],0,`An array holds one type; a record mixes types in named fields.`),
T(`<h3>String handling</h3><ul><li><b>LEN(s)</b>: the number of characters</li><li><b>Substrings</b>: part of a string, by position</li><li><b>Concatenation</b>: joining strings with +</li><li><b>Casting</b>: converting types, e.g. STRING_TO_INT('42') gives 42</li></ul>`),
N(`What's LEN('Hinkley')?`,7,0.001,'',`H-i-n-k-l-e-y: 7 characters.`),
Q(`What does 'Unit' + '1' give?`,[`'Unit1'`,`'Unit 1'`,`2`,`An error`],0,`Concatenation joins strings exactly, with no space added.`)]),
LH('gcs2-2-4','Subroutines',9,'Procedures and functions: write code once, use it everywhere.',[
T(`<h3>Subroutines</h3><p>A <b>subroutine</b> is a named block of code you can call whenever you need it.</p><ul><li>A <b>function</b> returns a value.</li><li>A <b>procedure</b> doesn't return a value; it just does something.</li></ul>`),
T(`<pre class="cs">SUBROUTINE toF(c)
   RETURN c * 9 / 5 + 32
ENDSUBROUTINE

OUTPUT toF(100)</pre><p><b>c</b> is a <b>parameter</b>. 100 is the <b>argument</b> passed in. It outputs 212.</p>`),
N(`Using toF above, what does toF(25) return?`,77,0.001,'',`25 × 9 ÷ 5 + 32 = 45 + 32 = 77.`),
T(`<h3>Local and global</h3><p>A <b>local variable</b> only exists inside its subroutine. A <b>global variable</b> can be used anywhere.</p><p>Local variables are safer: one subroutine can't accidentally change another's data, and the subroutine can be reused in other programs.</p>`),
Q(`Why are subroutines useful?`,[`Code is written once, reused, and easier to test and maintain`,`They make programs run faster`,`They stop all bugs`,`They use less storage space`],0,`That's the idea behind structured programming.`),
Q(`What's the difference between a function and a procedure?`,[`A function returns a value`,`A procedure returns a value`,`Functions can't have parameters`,`There's none`],0,`Both can take parameters, but only a function hands back a result.`)])]});
U({id:'gcs2-3',track:'gcs',level:2,title:'Data representation',icon:'Hx',color:'#D85A30',desc:'Binary, hexadecimal, units, binary arithmetic and character codes: AQA 3.3.',lessons:[
LH('gcs2-3-1','Binary and hexadecimal',10,'Converting between denary, binary and hex, and why programmers love hex.',[
T(`<h3>Hexadecimal</h3><p>Hex is base 16. It uses 0–9, then <b>A–F</b> for 10–15.</p><p>One hex digit is exactly <b>4 bits</b> (a nibble), so it's a short way to write binary.</p><div class="eq">1010 1111 = AF</div><p>1010 = 10 = A, and 1111 = 15 = F.</p>`),
T(`<h3>Hex to denary</h3><p>Place values are 16 and 1. <b>3C</b> = 3 × 16 + 12 = <b>60</b>.</p>`),
N(`Convert hex 2A to denary.`,42,0.001,'',`2 × 16 + 10 = 42.`),
Q(`What's binary 1100 0111 in hex?`,[`C7`,`7C`,`C8`,`B7`],0,`1100 = 12 = C, 0111 = 7.`),
N(`Convert hex FF to denary.`,255,0.001,'',`15 × 16 + 15 = 255: the biggest number in one byte.`),
Q(`Why do programmers use hex?`,[`It's shorter and easier to read than binary, with fewer mistakes`,`Computers store data in hex`,`It uses less memory`,`It's faster to process`],0,`Computers still store binary. Hex is just easier for humans.`)]),
LH('gcs2-3-2','Units and binary arithmetic',10,'kilobytes to terabytes, adding binary and binary shifts.',[
T(`<h3>Units</h3><p>AQA uses powers of 1,000:</p><ul><li><b>kilobyte (kB)</b> = 1,000 bytes</li><li><b>megabyte (MB)</b> = 1,000 kB</li><li><b>gigabyte (GB)</b> = 1,000 MB</li><li><b>terabyte (TB)</b> = 1,000 GB</li></ul>`),
N(`How many bytes are in 3 MB?`,3000000,0.001,'bytes',`3 × 1,000 × 1,000 = 3,000,000 bytes.`),
T(`<h3>Adding binary</h3><p>0 + 0 = 0 · 0 + 1 = 1 · 1 + 1 = 10 (write 0, carry 1) · 1 + 1 + 1 = 11 (write 1, carry 1).</p><p>If the answer needs more bits than you have, that's an <b>overflow</b>.</p>`),
Q(`What's 0101 + 0011 in binary?`,[`1000`,`0110`,`1001`,`0111`],0,`5 + 3 = 8 = 1000.`),
T(`<h3>Binary shifts</h3><p>A <b>left shift</b> of 1 place multiplies by 2. A <b>right shift</b> of 1 place divides by 2 (whole numbers only).</p><p>0000 0101 (5) shifted left 2 places is 0001 0100 (20).</p>`),
N(`0000 0110 is shifted left 3 places. What's the denary result?`,48,0.001,'',`6 × 2³ = 6 × 8 = 48.`),
Q(`Shifting 0011 0000 right by 4 places gives…`,[`0000 0011 (3)`,`0011 0000 (48)`,`1100 0000`,`0000 1100`],0,`48 ÷ 16 = 3.`)]),
LH('gcs2-3-3','Characters: ASCII and Unicode',8,'How text becomes numbers.',[
T(`<h3>Character encoding</h3><p>Each character is stored as a number called its <b>character code</b>. The set of characters a system can represent is its <b>character set</b>.</p><p>Codes are in order: if 'A' is 65, then 'B' is 66 and 'C' is 67. Digits and lowercase letters are in order too.</p>`),
T(`<h3>ASCII and Unicode</h3><ul><li><b>ASCII</b> uses 7 bits: 128 characters, enough for English letters, digits and symbols.</li><li><b>Unicode</b> uses more bits per character, so it can represent many more characters: every alphabet, symbols and emoji. Its first 128 codes match ASCII.</li></ul>`),
N(`'A' has character code 65. What's the code for 'E'?`,69,0.001,'',`A 65, B 66, C 67, D 68, E 69.`),
Q(`Why was Unicode needed?`,[`ASCII can't represent characters from other alphabets`,`ASCII was too slow`,`ASCII used too much memory`,`Unicode is shorter`],0,`128 characters isn't enough for the world's languages.`),
N(`How many characters can 7-bit ASCII represent?`,128,0.001,'',`2⁷ = 128.`),
Q(`'a' has code 97. What's 'c'?`,[`99`,`98`,`67`,`100`],0,`a 97, b 98, c 99.`)])]});
U({id:'gcs2-4',track:'gcs',level:2,title:'Computer systems',icon:'CPU',color:'#378ADD',desc:'Boolean logic, the CPU and fetch–execute cycle, memory, storage, software and translators: AQA 3.4.',lessons:[
LH('gcs2-4-1','Boolean logic',10,'Logic gates and truth tables: the maths inside every chip.',[
T(`<h3>The four gates</h3><ul><li><b>NOT</b>: flips the input. 1 → 0, 0 → 1.</li><li><b>AND</b>: output 1 only if <b>both</b> inputs are 1.</li><li><b>OR</b>: output 1 if <b>either</b> input is 1 (or both).</li><li><b>XOR</b>: output 1 if the inputs are <b>different</b>.</li></ul><p>AQA writes them as Ā (NOT), A.B (AND), A + B (OR) and A ⊕ B (XOR).</p>`),
Q(`A = 1, B = 0. What's A AND B?`,[`0`,`1`,`2`,`It depends`],0,`AND needs both inputs to be 1.`),
Q(`A = 1, B = 1. What's A XOR B?`,[`0`,`1`,`2`,`It depends`],0,`XOR is 1 only when the inputs are different.`),
T(`<h3>Combining gates</h3><p>A reactor trip: <b>T = (H AND P) OR M</b>, where H is "temperature high", P is "pressure high" and M is "manual trip". Work out each part in brackets first.</p>`),
Q(`In T = (H AND P) OR M, with H = 1, P = 0, M = 1, what's T?`,[`1`,`0`,`It depends`,`2`],0,`H AND P = 0, then 0 OR 1 = 1.`),
N(`How many rows does a truth table for 3 inputs have?`,8,0.001,'rows',`2³ = 8 combinations.`),
Q(`Which expression is 1 only when both A and B are 0?`,[`NOT (A OR B)`,`A AND B`,`A XOR B`,`NOT A AND B`],0,`A OR B is 0 only when both are 0, and NOT flips it to 1.`)]),
LH('gcs2-4-2','The CPU and fetch–execute',10,'What\'s inside the processor, and the cycle it repeats billions of times a second.',[
T(`<h3>Von Neumann architecture</h3><p>Programs and data are both stored in the same main memory. The CPU fetches instructions from memory and executes them one at a time.</p><p>Inside the CPU:</p><ul><li><b>ALU</b> (arithmetic logic unit): does calculations and logical comparisons.</li><li><b>Control unit</b>: decodes instructions and controls the other parts.</li><li><b>Clock</b>: sends regular pulses that keep everything in step.</li><li><b>Registers</b>: tiny, very fast storage locations inside the CPU.</li></ul><p><b>Buses</b> carry data, addresses and control signals between the CPU and memory.</p>`),
O(`Put the stages of the fetch–execute cycle in order.`,['Fetch the next instruction from main memory','Decode the instruction','Execute the instruction','Go back and fetch the next one'],`It repeats for every instruction.`),
Q(`Which part of the CPU carries out calculations?`,[`The ALU`,`The clock`,`The control unit`,`The cache`],0,`ALU: arithmetic logic unit.`),
T(`<h3>What makes a CPU faster?</h3><ul><li><b>Clock speed</b>: more cycles per second (measured in GHz).</li><li><b>More cores</b>: each core can run instructions at the same time.</li><li><b>More cache</b>: frequently used data is kept close to the CPU.</li></ul>`),
Q(`A 3.5 GHz CPU carries out about how many cycles a second?`,[`3.5 billion`,`3.5 million`,`3,500`,`35 billion`],0,`Giga means a billion (10⁹).`),
Q(`Why doesn't doubling the cores always double the speed?`,[`Some tasks can't be split up to run at the same time`,`Cores use more electricity`,`Cores share one clock`,`Extra cores slow down the cache`],0,`If each step needs the last one's result, only one core can work at a time.`)]),
LH('gcs2-4-3','Memory, storage and software',10,'RAM, ROM, cache and secondary storage, plus the software and translators that run on them.',[
T(`<h3>Main memory</h3><ul><li><b>RAM</b>: holds the programs and data in use right now. <b>Volatile</b>: it loses its contents when the power goes off.</li><li><b>ROM</b>: holds the instructions to start the computer up. <b>Non-volatile</b>: it keeps its contents.</li><li><b>Cache</b>: very fast, small memory near the CPU for frequently used data.</li></ul>`),
T(`<h3>Secondary storage</h3><p>Non-volatile storage for keeping files long term:</p><ul><li><b>Magnetic</b> (hard disk): cheap per GB, large, but has moving parts.</li><li><b>Optical</b> (CD, DVD, Blu-ray): cheap and portable, but small and slow.</li><li><b>Solid state</b> (SSD, USB flash): fast, robust, no moving parts, but more expensive per GB.</li></ul><p><b>Cloud storage</b> keeps your files on someone else's servers, reached over the internet.</p>`),
Q(`Which memory loses its contents when you switch off?`,[`RAM`,`ROM`,`An SSD`,`A hard disk`],0,`RAM is volatile.`),
Q(`A laptop needs fast, tough storage that won't break if it's dropped. Which is best?`,[`Solid state`,`Magnetic`,`Optical`,`ROM`],0,`No moving parts, so it handles knocks well.`),
T(`<h3>Languages and translators</h3><ul><li><b>Machine code</b>: binary instructions the CPU runs directly. <b>Assembly language</b>: short codes like ADD, one per machine instruction. Both are <b>low-level</b>.</li><li><b>High-level languages</b> like Python are easier to write and work on any computer.</li></ul><p>Translators: an <b>assembler</b> turns assembly into machine code; a <b>compiler</b> translates a whole program into machine code at once; an <b>interpreter</b> translates and runs it one line at a time.</p>`),
Q(`Which translator turns a whole program into a machine code file you can run without the source?`,[`A compiler`,`An interpreter`,`An assembler`,`An operating system`],0,`An interpreter has to translate every time the program runs.`),
Q(`Why might you write in a low-level language?`,[`For direct control of the hardware and very fast, small code`,`It's easier to read`,`It works on any CPU`,`It needs no translator at all`],0,`Used for things like embedded systems and device drivers.`)])]});
/* ----- Level 3: Year 11 ----- */
U({id:'gcs3-1',track:'gcs',level:3,title:'Images, sound and compression',icon:'▦',color:'#D4537E',desc:'Bitmap images, sampled sound, file sizes, run-length encoding and Huffman coding: AQA 3.3.',lessons:[
LH('gcs3-1-1','Images and sound',10,'How pictures and sounds become numbers, and how big the files are.',[
T(`<h3>Bitmap images</h3><p>A bitmap is a grid of <b>pixels</b>. Each pixel's colour is stored as a binary number.</p><ul><li><b>Image size</b>: width × height in pixels.</li><li><b>Colour depth</b>: bits per pixel. n bits gives 2<sup>n</sup> colours.</li></ul><div class="eq">file size (bits) = width × height × colour depth</div>`),
N(`An image is 100 × 50 pixels with a colour depth of 8 bits. How many bytes is it?`,5000,0.001,'bytes',`100 × 50 × 8 = 40,000 bits ÷ 8 = 5,000 bytes.`),
Q(`What happens if you increase the colour depth?`,[`More colours, bigger file`,`Fewer colours, smaller file`,`More pixels`,`Nothing changes`],0,`More bits per pixel means more possible colours, and more data.`),
T(`<h3>Sampled sound</h3><p>Sound is recorded by measuring the wave's amplitude many times a second. Each measurement is a <b>sample</b>.</p><ul><li><b>Sample rate</b>: samples per second (hertz).</li><li><b>Sample resolution</b>: bits per sample.</li></ul><div class="eq">file size (bits) = sample rate × resolution × seconds</div>`),
N(`A 10-second clip is sampled at 1,000 Hz with 8-bit resolution. How many bytes?`,10000,0.001,'bytes',`1,000 × 8 × 10 = 80,000 bits ÷ 8 = 10,000 bytes.`),
Q(`Raising the sample rate makes the recording…`,[`closer to the original sound, but a bigger file`,`smaller but lower quality`,`louder`,`shorter`],0,`More samples a second capture the wave more accurately.`),
N(`How many colours can a 4-bit colour depth show?`,16,0.001,'colours',`2⁴ = 16.`)]),
LH('gcs3-1-2','Compression: RLE and Huffman',11,'Two ways to make data smaller without losing any of it.',[
T(`<h3>Why compress?</h3><p>Smaller files take less storage and transfer faster over a network. <b>Lossless</b> compression shrinks a file so it can be restored exactly.</p>`),
T(`<h3>Run-length encoding (RLE)</h3><p>RLE replaces runs of the same value with a pair: <b>(how many, what)</b>.</p><p><b>0000011100</b> becomes <b>5 0, 3 1, 2 0</b>.</p><p>It works well when data has long runs, like simple images, and badly when values keep changing.</p>`),
Q(`What's AAAABBBCCD in RLE?`,[`4A 3B 2C 1D`,`A4 B3 C2 D1`,`4 3 2 1`,`ABCD`],0,`Count each run: four A, three B, two C, one D.`),
T(`<h3>Huffman coding</h3><p>Huffman coding gives <b>shorter codes to more common characters</b>.</p><ol><li>Count how often each character appears.</li><li>Build a tree: repeatedly join the two least frequent nodes.</li><li>Read each code from the root: left branch 0, right branch 1.</li></ol><p>In "BANANA", A is most common, so it gets the shortest code.</p>`),
Q(`In Huffman coding, which characters get the shortest codes?`,[`The most frequent ones`,`The least frequent ones`,`Vowels`,`They're all the same length`],0,`That's what makes the total number of bits smaller.`),
N(`Codes: A = 0, N = 10, B = 11. How many bits is "BANANA" in Huffman?`,9,0.001,'bits',`B 2 + A 1 + N 2 + A 1 + N 2 + A 1 = 9 bits.`),
N(`How many bits is "BANANA" in 7-bit ASCII?`,42,0.001,'bits',`6 characters × 7 bits = 42 bits. Huffman saved 33 bits.`)])]});
U({id:'gcs3-2',track:'gcs',level:3,title:'Networks',icon:'⇄',color:'#378ADD',desc:'Network types, topologies, protocols and the TCP/IP model: AQA 3.5.',lessons:[
LH('gcs3-2-1','Types of network',9,'PAN, LAN, WAN, wired and wireless, star and bus.',[
T(`<h3>What is a network?</h3><p>Two or more computers connected so they can share data and resources.</p><ul><li><b>PAN</b> (personal area network): devices around one person, like a phone and earbuds over Bluetooth.</li><li><b>LAN</b> (local area network): one site, like a school or a power station.</li><li><b>WAN</b> (wide area network): over a large area, often using leased lines. The internet is the biggest WAN.</li></ul>`),
Q(`A network connecting the offices in one building is a…`,[`LAN`,`WAN`,`PAN`,`topology`],0,`One site = local area network.`),
T(`<h3>Wired and wireless</h3><ul><li><b>Wired</b> (Ethernet cables): faster, more reliable, harder to intercept, but less flexible.</li><li><b>Wireless</b> (Wi-Fi): easy to connect anywhere, but slower, affected by walls and interference, and easier to snoop on, so it needs encryption.</li></ul>`),
T(`<h3>Topologies</h3><ul><li><b>Star</b>: every device connects to a central switch. If one cable fails, only that device is affected. If the switch fails, everything stops.</li><li><b>Bus</b>: every device connects to one main cable. Cheap, but if the main cable breaks, the whole network fails, and data collisions slow it down.</li></ul>`),
Q(`In a star topology, what happens if one device's cable breaks?`,[`Only that device loses its connection`,`The whole network goes down`,`Data collisions increase`,`The switch fails`],0,`That's a big advantage of star networks.`),
Q(`Why might a power station use wired connections for its control systems?`,[`They're more reliable and harder to intercept`,`They're cheaper to install`,`Wi-Fi doesn't work indoors`,`Cables need no security`],0,`Reliability and security matter most there.`)]),
LH('gcs3-2-2','Protocols and the TCP/IP model',10,'The rules computers follow to talk to each other.',[
T(`<h3>Protocols</h3><p>A <b>protocol</b> is a set of rules for communication. You need to know:</p><ul><li><b>Ethernet</b> and <b>Wi-Fi</b>: moving data across a wired or wireless network</li><li><b>TCP</b>: splits data into packets and makes sure they all arrive, in order</li><li><b>UDP</b>: sends packets fast, without checking (good for streaming)</li><li><b>IP</b>: addresses packets and routes them across networks</li><li><b>HTTP</b> and <b>HTTPS</b> (encrypted): web pages</li><li><b>SMTP</b>: sending email · <b>IMAP</b>: reading email kept on a server</li><li><b>FTP</b>: transferring files</li></ul>`),
Q(`Which protocol sends email from your device to a mail server?`,[`SMTP`,`IMAP`,`FTP`,`HTTP`],0,`SMTP sends. IMAP lets you read mail that stays on the server.`),
T(`<h3>The TCP/IP model</h3><p>Four layers, each doing one job:</p><ol><li><b>Application</b>: HTTP, HTTPS, SMTP, IMAP, FTP</li><li><b>Transport</b>: TCP, UDP</li><li><b>Internet</b>: IP</li><li><b>Link</b>: Ethernet, Wi-Fi</li></ol><p>Layers mean each protocol only does one job, and one layer can change without affecting the others.</p>`),
W('sortIt',{bins:['Application','Transport','Internet','Link'],items:[['HTTPS',0],['SMTP',0],['TCP',1],['UDP',1],['IP',2],['Ethernet',3],['Wi-Fi',3]]},`Put each protocol in its TCP/IP layer.`,`Application at the top, link at the bottom.`),
Q(`Why is HTTPS used for logging in to a website?`,[`It encrypts the data`,`It's faster than HTTP`,`It compresses the page`,`It blocks viruses`],0,`Encryption stops anyone in between reading your password.`),
Q(`Which protocol makes sure all the packets arrive in the right order?`,[`TCP`,`UDP`,`IP`,`FTP`],0,`UDP doesn't check; TCP does.`)])]});
U({id:'gcs3-3',track:'gcs',level:3,title:'Cyber security',icon:'🔒',color:'#BA7517',desc:'Social engineering, malware, penetration testing and how to defend against attacks: AQA 3.6.',lessons:[
LH('gcs3-3-1','Threats',10,'How attackers get in: tricking people, and malicious software.',[
T(`<h3>Social engineering</h3><p>Tricking <b>people</b> into giving away information or access:</p><ul><li><b>Blagging</b> (pretexting): inventing a story, like phoning as "IT support" to get a password.</li><li><b>Phishing</b>: fake emails or texts that look real, to get you to click a link or share details.</li><li><b>Pharming</b>: redirecting you from a real website to a fake one to steal your details.</li><li><b>Shouldering</b> (shoulder surfing): watching someone type their PIN or password.</li></ul>`),
Q(`Someone rings pretending to be from your bank and asks for your PIN to "check your account". That's…`,[`blagging`,`pharming`,`a virus`,`shouldering`],0,`An invented story to get information.`),
T(`<h3>Malware</h3><p>Malicious software:</p><ul><li><b>Computer virus</b>: attaches itself to files and spreads when they're shared or run.</li><li><b>Trojan</b>: pretends to be useful software but does harm in the background.</li><li><b>Spyware</b>: secretly records what you do, like your keystrokes, and sends it to the attacker.</li></ul>`),
Q(`A free "game" secretly lets attackers control your computer. It's a…`,[`Trojan`,`virus`,`phishing email`,`firewall`],0,`It's disguised as something useful.`),
T(`<h3>Other weaknesses</h3><ul><li>Weak or default passwords</li><li>Misconfigured access rights (people seeing data they shouldn't)</li><li>Removable media like USB sticks</li><li>Unpatched or outdated software</li></ul>`),
Q(`Why are USB sticks a risk in a power station?`,[`They can carry malware onto isolated systems`,`They use too much power`,`They're too slow`,`They break networks`],0,`Some famous attacks on industrial systems spread this way.`)]),
LH('gcs3-3-2','Defences',10,'Detecting and preventing attacks, and testing your own security.',[
T(`<h3>Preventing attacks</h3><ul><li><b>Biometrics</b>: fingerprints or face recognition. Hard to fake, can't be forgotten.</li><li><b>Password systems</b>: strong passwords, limits on wrong attempts.</li><li><b>CAPTCHA</b>: tests that a human, not a bot, is logging in.</li><li><b>Email confirmation</b>: proves you own an account when you sign up or reset a password.</li><li><b>Automatic software updates</b>: fix known security holes quickly.</li></ul>`),
Q(`What does a CAPTCHA protect against?`,[`Automated bots`,`Viruses on USB sticks`,`Shoulder surfing`,`Power cuts`],0,`Bots can't easily solve it, so they can't create accounts or guess passwords at speed.`),
T(`<h3>Penetration testing</h3><p>An organisation pays testers to try to break in, so weaknesses are found and fixed before real attackers find them.</p><ul><li><b>White-box</b>: simulates a malicious insider who knows about the system and may have some login details.</li><li><b>Black-box</b>: simulates an external attacker who knows nothing about the system.</li></ul>`),
Q(`A tester is given no information about a company's systems before trying to break in. That's…`,[`black-box penetration testing`,`white-box penetration testing`,`phishing`,`validation`],0,`Like a real outside attacker.`),
Q(`Why do automatic updates help security?`,[`They patch known vulnerabilities quickly`,`They make computers faster`,`They delete viruses already installed`,`They stop phishing emails arriving`],0,`Attackers often target holes that already have fixes.`),
Q(`Which defence stops shoulder surfing best?`,[`Biometric login, like a fingerprint`,`CAPTCHA`,`Email confirmation`,`A bus topology`],0,`There's no password or PIN to watch.`)])]});
U({id:'gcs3-4',track:'gcs',level:3,title:'Databases and SQL',icon:'⊞',color:'#1D9E75',desc:'Relational databases, keys and SQL queries: AQA 3.7.',lessons:[
LH('gcs3-4-1','Relational databases',9,'Tables, records, fields and keys, and why splitting data into tables helps.',[
T(`<h3>The words</h3><ul><li><b>Table</b>: stores data about one kind of thing, like Pumps.</li><li><b>Record</b>: one row: everything about one pump.</li><li><b>Field</b>: one column: one piece of data, like flow rate.</li><li><b>Primary key</b>: a field that's unique for every record, like PumpID.</li><li><b>Foreign key</b>: a field that's the primary key of another table, linking the two.</li></ul>`),
Q(`Each pump has a unique PumpID. In the Pumps table, PumpID is the…`,[`primary key`,`foreign key`,`record`,`query`],0,`It identifies each record uniquely.`),
T(`<h3>Why relational?</h3><p>If you store a technician's phone number in every maintenance record, it's repeated over and over. That's <b>data redundancy</b>. If it changes and you miss one copy, you get <b>data inconsistency</b>.</p><p>A relational database stores each fact once, in its own table, and links tables with keys.</p>`),
Q(`The Repairs table has a TechID field that links to the Technicians table. In Repairs, TechID is a…`,[`foreign key`,`primary key`,`record`,`table`],0,`It's the primary key of another table.`),
Q(`What problem does splitting data into linked tables solve?`,[`Data redundancy and inconsistency`,`Slow internet`,`Viruses`,`Compression`],0,`Each fact is stored once.`),
Q(`In a table of students, one row about one student is a…`,[`record`,`field`,`key`,`query`],0,`Rows are records, columns are fields.`)]),
LH('gcs3-4-2','SQL',10,'Ask a database questions, and change its data.',[
T(`<h3>SELECT</h3><pre class="cs">SELECT Name, Flow
FROM Pumps
WHERE Flow &gt; 50
ORDER BY Flow DESC</pre><p>Gets the name and flow of every pump with a flow over 50, highest first. ORDER BY ... ASC sorts the other way.</p>`),
Q(`Which part of a query chooses which records you get back?`,[`WHERE`,`SELECT`,`FROM`,`ORDER BY`],0,`SELECT chooses the fields, FROM the table, WHERE the records.`),
T(`<h3>Changing data</h3><pre class="cs">INSERT INTO Pumps (PumpID, Name, Flow)
VALUES ('P7', 'Feed pump C', 62)

UPDATE Pumps SET Flow = 0 WHERE PumpID = 'P7'

DELETE FROM Pumps WHERE PumpID = 'P7'</pre>`),
Q(`What happens if you run DELETE FROM Pumps without a WHERE?`,[`Every record in the table is deleted`,`Nothing happens`,`Only the first record is deleted`,`An error stops it`],0,`Always check your WHERE before deleting or updating.`),
Q(`Which query gets every field for pumps named 'Feed pump A'?`,[`SELECT * FROM Pumps WHERE Name = 'Feed pump A'`,`SELECT Pumps WHERE Name = 'Feed pump A'`,`GET * FROM Pumps`,`SELECT Name FROM 'Feed pump A'`],0,`* means all fields.`),
Q(`To sort results from A to Z by Name, you'd add…`,[`ORDER BY Name ASC`,`ORDER BY Name DESC`,`WHERE Name ASC`,`SORT Name`],0,`ASC is ascending, DESC is descending.`)])]});
U({id:'gcs3-5',track:'gcs',level:3,title:'Robust programs and the law',icon:'⚖',color:'#5F7A8C',desc:'Validation, authentication, testing, and the ethical, legal and environmental impacts of technology: AQA 3.2 and 3.8.',lessons:[
LH('gcs3-5-1','Validation and testing',10,'Programs that don\'t fall over when people type the wrong thing.',[
T(`<h3>Validation</h3><p>Checking input is sensible <b>before</b> using it:</p><ul><li><b>Range check</b>: between limits, like 0 to 100</li><li><b>Length check</b>: like a password at least 8 characters</li><li><b>Presence check</b>: something has been entered</li><li><b>Type check</b>: a number where a number is needed</li><li><b>Format check</b>: like a date as DD/MM/YYYY</li></ul><p>Validation checks data is <i>sensible</i>, not that it's <i>correct</i>.</p>`),
T(`<h3>Authentication</h3><p>Checking a user is who they say they are, like asking for a username and password before letting them in.</p>`),
T(`<h3>Test data</h3><p>For an input that must be from 1 to 10:</p><ul><li><b>Normal</b> (typical): 5</li><li><b>Boundary</b> (extreme): 1 and 10, the very edges, plus just outside: 0 and 11</li><li><b>Erroneous</b>: data that should be rejected, like 'seven' or 25</li></ul>`),
Q(`An age must be from 11 to 18. Which is boundary test data?`,[`18`,`14`,`'fifteen'`,`40`],0,`Boundary data sits right at the edge of what's allowed.`),
Q(`A program crashes when someone types letters into a number box. What was missing?`,[`A type check`,`A range check`,`Authentication`,`A presence check`],0,`It should have checked the input is a number first.`),
Q(`What's the difference between a syntax error and a logic error?`,[`A syntax error stops the program running; a logic error runs but gives the wrong result`,`They're the same`,`A logic error stops the program; a syntax error gives the wrong answer`,`Only compilers find logic errors`],0,`Testing with good test data finds logic errors.`)]),
LH('gcs3-5-2','Ethics, law and the environment',10,'The impact of computing on people, privacy and the planet.',[
T(`<h3>Key laws in the UK</h3><ul><li><b>Data Protection Act 2018</b>: personal data must be used fairly, kept secure, kept accurate and not kept longer than needed.</li><li><b>Computer Misuse Act 1990</b>: makes it illegal to access a computer without permission, to do so to commit further crimes, or to change or damage data without permission.</li><li><b>Copyright, Designs and Patents Act 1988</b>: protects people's creative work, including software, from being copied without permission.</li></ul>`),
Q(`Someone guesses a teacher's password and logs in to change their grades. Which law have they broken?`,[`The Computer Misuse Act 1990`,`The Copyright, Designs and Patents Act 1988`,`Only school rules`,`No law`],0,`Unauthorised access with intent to change data.`),
T(`<h3>Ethical and privacy issues</h3><ul><li><b>Privacy</b>: phones and apps collect location and personal data. Who owns it?</li><li><b>Surveillance</b>: CCTV, facial recognition and monitoring.</li><li><b>Jobs</b>: automation replaces some jobs and creates new ones.</li><li><b>The digital divide</b>: not everyone can afford or access technology.</li></ul>`),
T(`<h3>Environmental impact</h3><ul><li>Making devices uses energy and rare metals.</li><li>Data centres use huge amounts of electricity and cooling.</li><li>E-waste: old devices often end up in landfill or shipped abroad.</li><li>But technology also helps: smart grids, remote meetings instead of travel, and control systems that run power stations efficiently.</li></ul>`),
Q(`Which is a positive environmental impact of computing?`,[`Smart grids and video calls can reduce energy use and travel`,`E-waste`,`Data centres' electricity use`,`Mining rare metals`],0,`Exam questions often want both sides.`),
Q(`A company sells its customers' data without asking. Which law does this break?`,[`The Data Protection Act 2018`,`The Computer Misuse Act 1990`,`The Copyright, Designs and Patents Act 1988`,`None`],0,`Personal data must be used fairly and lawfully.`)])]});
/* ----- Level 4: grade 7–8 problem solving ----- */
U({id:'gcs4-1',track:'gcs',level:4,title:'Exam problem solving',icon:'7–8',color:'#e8742a',desc:'Harder tracing, multi-step calculations and three-input logic, the way Papers 1 and 2 test them.',lessons:[
LH('gcs4-1-1','Tracing harder code',11,'Nested loops, arrays and conditions together.',[
T(`<h3>Work line by line</h3><p>For harder code, draw a trace table with one column per variable and one for output. Never jump ahead: update one value at a time.</p>`),
N(`<pre class="cs">total ← 0
FOR i ← 1 TO 3
   FOR j ← 1 TO 2
      total ← total + i
   ENDFOR
ENDFOR
OUTPUT total</pre>What's output?`,12,0.001,'',`The inner loop adds i twice for each i: 2 + 4 + 6 = 12.`),
N(`<pre class="cs">temps ← [300, 325, 310, 330, 319]
count ← 0
FOR i ← 0 TO 4
   IF temps[i] &gt; 320 THEN
      count ← count + 1
   ENDIF
ENDFOR
OUTPUT count</pre>What's output?`,2,0.001,'',`Only 325 and 330 are over 320.`),
N(`<pre class="cs">a ← [4, 9, 2, 7]
best ← a[0]
FOR i ← 1 TO 3
   IF a[i] &gt; best THEN
      best ← a[i]
   ENDIF
ENDFOR
OUTPUT best</pre>What's output?`,9,0.001,'',`It finds the largest value.`),
Q(`What does this algorithm do? <pre class="cs">n ← USERINPUT
r ← 0
WHILE n &gt; 0
   r ← r + n MOD 10
   n ← n DIV 10
ENDWHILE
OUTPUT r</pre>`,[`Adds up the digits of n`,`Reverses n`,`Counts the digits of n`,`Outputs n squared`],0,`n MOD 10 is the last digit, and n DIV 10 removes it. For 472: 2 + 7 + 4 = 13.`),
N(`Using that algorithm, what's output for n = 2028?`,12,0.001,'',`2 + 0 + 2 + 8 = 12.`)]),
LH('gcs4-1-2','Calculations',11,'File sizes, units and number bases in multi-step questions.',[
T(`<h3>Watch the units</h3><p>Most mistakes are in the last step. Work in <b>bits</b>, then divide by 8 for bytes, then by 1,000 for kB, and so on.</p>`),
N(`An image is 800 × 600 pixels with 24-bit colour. What's its size in MB?`,1.44,0.005,'MB',`800 × 600 × 24 = 11,520,000 bits ÷ 8 = 1,440,000 bytes = 1.44 MB.`),
N(`A 3-minute song is sampled at 44,100 Hz with 16-bit resolution (one channel). What's its size in MB, to 1 decimal place?`,15.9,0.006,'MB',`44,100 × 16 × 180 = 127,008,000 bits ÷ 8 = 15,876,000 bytes ≈ 15.9 MB.`),
N(`How many 5 MB photos fit on a 2 GB memory card?`,400,0.001,'photos',`2 GB = 2,000 MB. 2,000 ÷ 5 = 400.`),
N(`An image needs to show 200 different colours. What's the smallest colour depth, in bits?`,8,0.001,'bits',`2⁷ = 128 isn't enough, 2⁸ = 256 is.`),
Q(`Add 1011 0110 and 0110 0101 in 8 bits. What happens?`,[`Overflow: the answer needs 9 bits`,`The answer is 1111 1111`,`The answer is 0001 1011`,`Nothing unusual`],0,`182 + 101 = 283, which is more than 255.`)]),
LH('gcs4-1-3','Logic circuits',11,'Three inputs, truth tables and writing the expression for a circuit.',[
T(`<h3>Three-input truth tables</h3><p>With A, B and C there are 8 rows: 000, 001, 010, 011, 100, 101, 110, 111. Add a column for each gate, working from the inputs towards the output.</p>`),
Q(`Q = (A AND B) OR NOT C. With A = 0, B = 1, C = 0, what's Q?`,[`1`,`0`,`2`,`It depends`],0,`A AND B = 0, NOT C = 1, so 0 OR 1 = 1.`),
N(`For Q = A AND B AND C, how many of the 8 rows give Q = 1?`,1,0.001,'row',`Only when all three are 1.`),
N(`For Q = A OR B OR C, how many of the 8 rows give Q = 1?`,7,0.001,'rows',`Every row except 000.`),
Q(`A safety system trips if two out of two channels (A and B) agree, or if the operator presses the trip (M). Which expression is it?`,[`(A AND B) OR M`,`A OR B OR M`,`(A OR B) AND M`,`A AND B AND M`],0,`Both channels together, or the manual button on its own.`),
Q(`Which gate's output is 1 when its two inputs are different?`,[`XOR`,`AND`,`OR`,`NOT`],0,`Exclusive OR.`)])]});

/* ----- Level 5: grade 9 ----- */
U({id:'gcs5-1',track:'gcs',level:5,title:'Grade 9 challenges',icon:'9',color:'#c9a227',desc:'Building Huffman trees, SQL across two tables, writing algorithms and extended answers.',lessons:[
LH('gcs5-1-1','Building Huffman trees',12,'From frequencies to a full tree and codes, the way the top questions ask.',[
T(`<h3>Step by step</h3><p>Text: <b>SEES SEA</b> (ignoring the space). Frequencies: E 3, S 3, A 1.</p><ol><li>Take the two smallest: A (1) and one of the 3s, say S (3). Join them: a node worth 4.</li><li>Now you have E (3) and AS (4). Join them: the root, worth 7.</li><li>Label left 0 and right 1. E = 0, A = 10, S = 11.</li></ol>`),
N(`With E = 0, A = 10 and S = 11, how many bits is SEESSEA (7 letters)?`,11,0.001,'bits',`S S S = 3 × 2 = 6, E E E = 3 × 1 = 3, A = 2. Total 11.`),
N(`How many bits would SEESSEA take in 7-bit ASCII?`,49,0.001,'bits',`7 × 7 = 49. Huffman saves 38 bits.`),
Q(`Why must a Huffman tree be sent along with the compressed data?`,[`So the receiver can decode the bits back into characters`,`To make the file bigger`,`To encrypt it`,`It doesn't need to be`],0,`Without the tree, the codes mean nothing.`),
Q(`No Huffman code is the start of another code. Why does that matter?`,[`The bits can be decoded without any gaps between codes`,`It makes the codes shorter`,`It stops viruses`,`It sorts the characters`],0,`When you reach a leaf, you know the character has ended.`)]),
LH('gcs5-1-2','SQL across two tables, and writing algorithms',12,'Joining tables in a query, and writing your own code in exam pseudo-code.',[
T(`<h3>Two tables</h3><p>Pumps(PumpID, Name, TechID) and Technicians(TechID, TechName). To list each pump with its technician's name:</p><pre class="cs">SELECT Pumps.Name, Technicians.TechName
FROM Pumps, Technicians
WHERE Pumps.TechID = Technicians.TechID</pre><p>The WHERE joins the foreign key to the primary key.</p>`),
Q(`What does Pumps.TechID = Technicians.TechID do in that query?`,[`Links each pump to its technician's record`,`Deletes duplicates`,`Sorts the results`,`Creates a new table`],0,`Without it, you'd get every pump paired with every technician.`),
T(`<h3>Writing algorithms</h3><p>Exam questions ask you to write code, like: "Ask for 5 temperatures and output how many are over 320."</p><pre class="cs">count ← 0
FOR i ← 1 TO 5
   t ← STRING_TO_INT(USERINPUT)
   IF t &gt; 320 THEN
      count ← count + 1
   ENDIF
ENDFOR
OUTPUT count</pre><p>Marks come for: the loop, the input, the comparison, the counter and the output.</p>`),
Q(`A question says "keep asking until the user enters a number from 1 to 10". Which structure fits?`,[`A REPEAT…UNTIL or WHILE loop with a range check`,`A FOR loop from 1 to 10`,`A single IF statement`,`An array`],0,`You don't know how many tries it will take, so it's indefinite iteration.`),
N(`<pre class="cs">SUBROUTINE f(n)
   IF n ≤ 1 THEN
      RETURN 1
   ENDIF
   RETURN n * f(n − 1)
ENDSUBROUTINE</pre>What does f(4) return?`,24,0.001,'',`4 × 3 × 2 × 1 = 24. The subroutine calls itself.`)]),
LH('gcs5-1-3','Extended answers',12,'The 6- to 9-mark questions on ethics, law, security and networks.',[
T(`<h3>How they're marked</h3><p>Long answers are marked in levels. The top level needs:</p><ul><li>several <b>developed</b> points, each explained, not just listed</li><li><b>both sides</b> when asked to discuss or evaluate</li><li>links to the <b>scenario</b> in the question</li><li>a <b>judgement</b> at the end if it asks you to decide</li></ul>`),
Q(`A question asks you to "discuss" the impact of facial recognition in town centres. What gets the top marks?`,[`Developed points on both sides (safety and privacy) linked to the scenario, with a conclusion`,`A list of ten facts`,`One very detailed point`,`Only the advantages`],0,`Discuss means both sides, explained.`),
Q(`Which is a <b>developed</b> point?`,[`Biometric logins can't be shoulder surfed because there's no password to watch, which protects the control system`,`Biometrics are good`,`Fingerprints exist`,`It is secure`],0,`It makes a point, explains why, and links it to the context.`),
Q(`A power station wants to move its control system onto the cloud. What's the strongest argument against?`,[`It depends on an internet connection and opens it to remote attacks`,`Cloud storage is always slow`,`The cloud is illegal`,`It's too cheap`],0,`Critical control systems are usually kept isolated for exactly this reason.`),
Q(`In an evaluation question, the conclusion should…`,[`make a judgement and say why`,`repeat the question`,`list new facts`,`be left out`],0,`Weigh the points you made and decide.`)])]});

/* every Computer Science unit gets a unit test built from its own lesson questions */
UNITS.forEach(function(u){if(u.track!=='gcs'||TESTS[u.id])return;var cs=[];u.lessons.forEach(function(l){l.cards.forEach(function(c){if(c.t==='Q'||c.t==='N')cs.push(x(l.id,Object.assign({},c)))})});TT(u.id,cs)});
/* ===== gcse levels end ===== */
/* >>> new content: al >>> */
