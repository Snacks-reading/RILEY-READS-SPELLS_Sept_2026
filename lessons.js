/* Original Star Speller registry; new authored teaching and contextual word bank. */
(() => {
  const bank = (text, code, reserved = false) => text.trim().split('\n').map((line, i) => {
    const [word, map, sentence, hook = ''] = line.split('|');
    return { id: `${code}-${reserved ? 'transfer' : 'learn'}-${i + 1}`, word, map, sentence, hook, skill: code, reserved };
  });
  const lessons = [];
  function add(code, title, rule, hook, contrast, check, learn, transfer) {
    lessons.push({ code, title, rule, hook, contrast, check, words: bank(learn, code), transfer: bank(transfer, code, true) });
  }
  add('A1', 'Guard the Vowel',
    'A closed syllable ends in a consonant and usually has a short vowel. After one short vowel at the end of a one-syllable base, /k/ is usually ck, /ch/ is usually tch, and /j/ is usually dge.',
    'Short vowel, close the gate: check the letters right after it.',
    'Compare back with bake. In back, ck follows the short vowel. In bake, the final e is part of a different vowel pattern. Watch exceptions such as rich and much.',
    { prompt: 'Why does scratch end in tch?', correct: 'The /ch/ sound follows one short vowel in a one-syllable word.', wrong: ['Every /ch/ sound is spelled tch.', 'The vowel is long.', 'Every word ending in h needs a t.'] },
    `scratch|scr • a • tch|A tiny scratch marked the polished table.|Keep the short a next to tch.
bridge|br • i • dge|The bridge connects the two riverbanks.|Short i, then dge.
kitchen|kitch • en|Riley measured fabric at the kitchen table.|KITCH holds the short i and tch.
backpack|back • pack|Her backpack held the science notebook.|Both short-vowel parts finish with ck.
judgment|judg • ment|The judge used careful judgment.|The base judge loses e before this ending.
picnic|pic • nic|The class planned a picnic after the exhibition.|Keep both short i vowels.
patch|p • a • tch|She sewed a patch onto the jacket.|Short a, then tch.
locket|lock • et|The locket contained a small photograph.|LOCK keeps ck before the next part.`,
    `fetch|f • e • tch|Please fetch the measuring tape.
smudge|sm • u • dge|A smudge of paint covered the corner.
snatch|sn • a • tch|The bird tried to snatch a crumb.
pledge|pl • e • dge|The club made a pledge to help.
crutch|cr • u • tch|He used a crutch while his ankle healed.
badge|b • a • dge|The scout earned a sewing badge.
pitch|p • i • tch|Her voice rose in pitch.
trudge|tr • u • dge|They had to trudge through the deep snow.
sketch|sk • e • tch|The designer drew a sketch of the dress.
hedge|h • e • dge|A tall hedge bordered the garden.
clutch|cl • u • tch|She held the clutch during the party.
wedge|w • e • dge|A wedge kept the door open.
batch|b • a • tch|We baked a batch of cookies.
hitch|h • i • tch|The trailer hitch needed repair.
notch|n • o • tch|A notch in the ruler marked the measurement.
latch|l • a • tch|Close the latch on the gate.`);
  add('A1.5', 'FLOSS Rule',
    'At the end of a one-syllable base word, f, l, s, and often z usually double after one short vowel. The doubled letters represent one consonant sound. This is a useful pattern, not a rule for every word.',
    'F • L • S: give the short vowel a double-letter finish.',
    'Compare hiss with his. Hiss follows the pattern; his is an exception. When a suffix is added, keep the base spelling: skill + ful becomes skillful, with one l in ful.',
    { prompt: 'What does FLOSS tell you about cliff?', correct: 'Double final f after the short vowel in this one-syllable base.', wrong: ['Double every consonant.', 'Give the word two syllables.', 'Double f whenever it appears.'] },
    `skill|sk • i • ll|Sewing takes patience and skill.|Short i ends with ll.
cliff|cl • i • ff|The path stopped near a steep cliff.|Short i ends with ff.
miss|m • i • ss|Do not miss the final clue.|Short i ends with ss.
buzz|b • u • zz|We heard a bee buzz near the flowers.|Short u often ends with zz.
skillful|skill • ful|Her skillful stitching made a neat seam.|Keep ll in skill; ful has one l.
illness|ill • ness|The illness kept him home for a week.|ILL and NESS both keep their double letters.
stiffness|stiff • ness|Stretching helped reduce the stiffness.|Keep STIFF, then add NESS.
classroom|class • room|The classroom displayed every student's art.|CLASS keeps ss inside the compound.`,
    `fluff|fl • u • ff|Remove the fluff from the sweater.
sniff|sn • i • ff|The dog gave the bag a sniff.
bliss|bl • i • ss|The peaceful afternoon felt like bliss.
quill|qu • i • ll|The writer dipped the quill into ink.
spill|sp • i • ll|Be careful not to spill the paint.
trill|tr • i • ll|The bird sang a quick trill.
whiff|wh • i • ff|We caught a whiff of fresh bread.
gruff|gr • u • ff|The character spoke in a gruff voice.
gloss|gl • o • ss|A clear gloss protected the painting.
thrill|thr • i • ll|The final performance gave her a thrill.
scuff|sc • u • ff|A scuff marked the leather boot.
frill|fr • i • ll|A frill decorated the sleeve.
fuss|f • u • ss|There was no need to make a fuss.
shell|sh • e • ll|The shell had a spiral pattern.
staff|st • a • ff|The museum staff welcomed visitors.
floss|fl • o • ss|Use floss to clean between your teeth.`);
  add('A2', 'Silent-E',
    'A vowel-consonant-e syllable often has a long vowel. A final e has other jobs too, such as keeping c or g soft. Usually drop final silent e before a vowel suffix; usually keep it before a consonant suffix.',
    'Name the job of e before you decide whether it stays.',
    'Hope + ing becomes hoping, but safe + ly becomes safely. Noticeable keeps e to keep c soft. Silent e does not make every vowel long: have and give are exceptions.',
    { prompt: 'Why does safely keep its e?', correct: 'The suffix ly starts with a consonant, so the base usually keeps e.', wrong: ['All suffixes keep final e.', 'The word needs a second y.', 'The suffix begins with a vowel.'] },
    `hoping|hop • ing|She was hoping the costume would fit.|Drop e from hope before ing.
safely|safe • ly|Store the scissors safely after sewing.|Keep e before ly.
invited|in • vit • ed|The club invited a local artist.|Invite drops final e before ed.
excitement|ex • cite • ment|The announcement caused excitement.|Keep e before ment.
making|mak • ing|Riley is making a new skirt.|Make drops e before ing.
movement|move • ment|The dancer practiced the movement.|Keep e before ment.
noticing|not • ic • ing|She kept noticing details in the painting.|Notice drops e before ing.
noticeable|notice • able|The change in color was noticeable.|Keep e so c stays soft.`,
    `bravely|brave • ly|She spoke bravely in front of the class.
shaping|shap • ing|The artist was shaping the clay.
useful|use • ful|The diagram was useful during the repair.
statement|state • ment|His statement described what happened.
arriving|ar • riv • ing|The guests are arriving before sunset.
amusement|a • muse • ment|The funny scene provided amusement.
placement|place • ment|The placement of each seam matters.
widely|wide • ly|The book was widely discussed.
escaping|es • cap • ing|Steam was escaping through the opening.
closely|close • ly|Examine the pattern closely.
graceful|grace • ful|Her graceful movement impressed the audience.
entirely|entire • ly|The design was entirely her own.
changing|chang • ing|The weather was changing quickly.
reusable|re • us • able|Bring a reusable bag to the store.
tasteless|taste • less|The plain soup seemed tasteless.
careless|care • less|A careless measurement wasted the fabric.`);
  add('A3', 'Vowel Teams',
    'A vowel team uses two or more letters to spell a vowel sound. Teams such as ai, ay, ee, ea, oa, and ow have common patterns, but one sound can have several spellings and a team can have more than one sound.',
    'Listen for the vowel, then connect the sound to a known word family.',
    'Rain and day share a long-a sound but use different teams. Read in “I read yesterday” shows why context matters. “The first vowel does the talking” is not a dependable rule.',
    { prompt: 'Which is a dependable way to use a vowel team?', correct: 'Connect its sound and spelling to a known pattern and the word context.', wrong: ['Always pronounce the first vowel long.', 'Ignore the sentence.', 'Spell every long-a sound with ai.'] },
    `reason|rea • son|Give one reason that supports your answer.|REA keeps ea together.
season|sea • son|The growing season begins in spring.|SEA keeps ea together.
teacher|teach • er|The teacher explained the diagram.|TEACH keeps ea together.
coastline|coast • line|The map showed the coastline.|COAST keeps oa together.
daylight|day • light|We finished the work before daylight faded.|DAY ends with ay.
freedom|free • dom|The speech described the struggle for freedom.|FREE keeps ee together.
rainfall|rain • fall|The rainfall filled the dry creek.|RAIN uses ai inside the base.
approach|ap • proach|Explain your approach to the problem.|PROACH keeps oa together.`,
    `railroad|rail • road|The railroad carried goods across the region.
speech|sp • ee • ch|She practiced her speech before the meeting.
meadow|mead • ow|Wildflowers grew in the meadow.
roadside|road • side|A roadside sign gave directions.
payment|pay • ment|The payment arrived on time.
seaweed|sea • weed|Seaweed washed onto the beach.
cheerful|cheer • ful|Her cheerful greeting made us smile.
oatmeal|oat • meal|We ate oatmeal before school.
weekday|week • day|The library opens early on each weekday.
coaching|coach • ing|The coaching helped her improve.
railway|rail • way|The railway connected distant cities.
streaming|stream • ing|The show is streaming this evening.
load|l • oa • d|The truck carried a heavy load.
beaming|beam • ing|She was beaming after the performance.
goalkeeper|goal • keep • er|The goalkeeper blocked the shot.
playground|play • ground|The playground opened after the rain.`);
  add('A4', 'R-Controlled Vowels',
    'When a vowel is followed by r in the same syllable, r changes the vowel sound. Ar and or often have recognizable sounds; er, ir, and ur may sound alike, so use a word family or a remembered spelling.',
    'Hear the r; remember the vowel that travels with it.',
    'Fern, bird, and turn can share a similar vowel sound but have different spellings. Purpose starts with pur, not pour. Pronunciation alone cannot choose every r-controlled spelling.',
    { prompt: 'Why is sound alone sometimes insufficient for er, ir, and ur?', correct: 'Those spellings can represent a similar sound.', wrong: ['They are always silent.', 'They must all be spelled er.', 'R never affects a vowel.'] },
    `purpose|pur • pose|The author explained the purpose of the letter.|PUR, not POUR, begins purpose.
ordinary|or • di • nar • y|An ordinary day became unforgettable.|OR begins it; keep the middle i.
surface|sur • face|The surface of the water reflected the moon.|SUR begins surface.
further|fur • ther|Read further to find more evidence.|FUR begins further.
surprise|sur • prise|The surprise delighted the whole family.|SUR comes before PRISE.
perfect|per • fect|No first draft is perfect.|PER begins perfect.
curtain|cur • tain|The curtain rose before the performance.|CUR begins curtain.
portrait|por • trait|The portrait showed the artist's grandmother.|POR begins portrait.`,
    `harvest|har • vest|The harvest provided food for the community.
border|bor • der|The river formed a natural border.
thirteen|thir • teen|Thirteen students entered the contest.
furniture|fur • ni • ture|The room needed new furniture.
circuit|cir • cuit|The broken circuit stopped the light.
merchant|mer • chant|The merchant traded cloth for grain.
argument|ar • gu • ment|Support the argument with evidence.
disturb|dis • turb|Do not disturb the sleeping puppy.
thermal|ther • mal|The class measured thermal energy.
harbor|har • bor|The ship entered the harbor.
burden|bur • den|Sharing the work reduced the burden.
concern|con • cern|She expressed concern about the delay.
orbit|or • bit|The moon travels in an orbit.
sturdy|stur • dy|The sturdy table supported the machine.
artist|ar • tist|The artist painted a colorful mural.
northern|north • ern|Snow covered the northern hills.`);
  add('A5', 'Diphthongs',
    'A diphthong is a vowel sound that glides between positions in your mouth. Common spelling patterns include oi or oy and ou or ow. Oi is common inside a syllable and oy at its end; the ou/ow choice often needs word knowledge.',
    'Let the sound glide; keep its spelling team together.',
    'Coin and joyful share the oi/oy sound. Cloud and flower share the ou/ow sound. Do not add a silent e to avoid. Cow shows why “ow only at the end” is too simple.',
    { prompt: 'Which explanation fits joyful?', correct: 'The base joy ends with oy; adding ful keeps the base.', wrong: ['The base must change to joi.', 'Every vowel glide uses ou.', 'Joyful ends in a silent e.'] },
    `choice|ch • oi • ce|She made a careful choice of fabric.|CHOI uses oi; final ce spells /s/.
avoid|a • void|Avoid cutting before you measure.|VOID keeps oi; no final e.
loyal|loy • al|The loyal dog stayed beside her.|LOY keeps oy together.
joyful|joy • ful|The joyful audience applauded.|Keep JOY, then FUL.
announcement|an • nounce • ment|The announcement gave the concert date.|NOUNCE holds ou.
boundary|bound • ar • y|The fence marks the boundary.|BOUND uses ou.
powerful|power • ful|The waterfall created a powerful current.|POWER holds ow.
pointless|point • less|Repeating the same mistake felt pointless.|POINT keeps oi.`,
    `appoint|ap • point|The club will appoint a new leader.
employer|em • ploy • er|The employer offered a summer job.
rejoice|re • joice|The team had a reason to rejoice.
voyage|voy • age|The voyage crossed the ocean.
outbound|out • bound|The outbound train left at noon.
thousand|thou • sand|A thousand people attended the festival.
drought|dr • ou • ght|The drought dried the farmland.
coward|cow • ard|The story's villain called him a coward.
allowance|al • low • ance|She saved her allowance for supplies.
flowerpot|flower • pot|The flowerpot stood near the window.
destroy|de • stroy|A fire can destroy an unprotected forest.
joint|j • oi • nt|The joint lets the arm bend.
ointment|oint • ment|Apply the ointment to the scratch.
surround|sur • round|Tall trees surround the clearing.
countless|count • less|Countless stars filled the night sky.
downward|down • ward|The ball rolled downward.`);
  add('A6', 'Syllable Types',
    'Written syllables commonly follow six patterns: closed, open, vowel-consonant-e, vowel team, vowel-r, and consonant-le. Locate vowel sounds and meaningful word parts, then examine each written syllable.',
    'One vowel sound per spoken beat; one spelling plan for every written part.',
    'Rabbit has closed syllables, robot begins with an open syllable, and table ends in consonant-le. Spoken beats and spelling chunks are useful tools, but they are not always identical.',
    { prompt: 'How should syllable knowledge help with a long word?', correct: 'Examine its vowel patterns and keep every spoken and meaningful part.', wrong: ['Delete quiet vowels.', 'Assume every syllable has a short vowel.', 'Count letters instead of vowel sounds.'] },
    `rabbit|rab • bit|The rabbit rested beside the fence.|Two closed syllables keep short vowels.
robot|ro • bot|The robot followed the programmed route.|RO is open; BOT is closed.
table|ta • ble|The fabric covered the table.|TA is open; BLE is the stable ending.
sunshine|sun • shine|The sunshine warmed the room.|SUN is closed; SHINE uses silent e.
compete|com • pete|She will compete in the design contest.|COM is closed; PETE uses silent e.
chapter|chap • ter|The chapter introduces a new character.|CHAP is closed; TER uses vowel-r.
reptile|rep • tile|The reptile rested under a warm lamp.|REP is closed; TILE uses silent e.
payment|pay • ment|The payment covered the materials.|PAY uses a vowel team; MENT is closed.`,
    `volcano|vol • ca • no|The volcano released ash into the sky.
magnet|mag • net|The magnet attracted the iron nail.
rotation|ro • ta • tion|Earth's rotation causes day and night.
humid|hu • mid|The humid air felt damp.
remote|re • mote|The remote island had few visitors.
lifeboat|life • boat|The lifeboat carried the passengers safely.
flannel|flan • nel|The flannel shirt felt soft.
staple|sta • ple|A staple held the papers together.
fabric|fab • ric|The fabric had a bright pattern.
music|mu • sic|The music filled the theater.
hotel|ho • tel|The hotel overlooked the river.
tulip|tu • lip|A tulip bloomed by the door.
planet|plan • et|The planet travels around its star.
cable|ca • ble|The cable connected the equipment.
insect|in • sect|The insect had six legs.
sunset|sun • set|The sunset colored the clouds.`);
  add('A7', 'Consonant Doubling',
    'Before a vowel suffix, a one-syllable base with one short vowel followed by one final consonant usually doubles that consonant. In a longer base, check whether the final syllable is stressed. Do not double final w, x, or y.',
    'Short vowel + one final consonant + vowel ending: check the double.',
    'Hop + ing becomes hopping; hope + ing becomes hoping. Begin becomes beginning because the final syllable is stressed. Visit becomes visiting without doubling because its final syllable is not stressed.',
    { prompt: 'Why does beginning have nn?', correct: 'Begin ends in a stressed syllable with one vowel and one final consonant before ing.', wrong: ['Every ing word doubles its last letter.', 'The first syllable is stressed.', 'Begin already ends in nn.'] },
    `planning|plan • n • ing|We are planning a science project.|Keep PLAN and add a second n before ing.
beginning|begin • n • ing|The beginning introduces the conflict.|Stress the end of begin; double n.
preferred|prefer • r • ed|She preferred the darker fabric.|Stress the end of prefer; double r.
hopping|hop • p • ing|The rabbit was hopping across the grass.|Double p after the short o.
stopped|stop • p • ed|The machine stopped during the lesson.|Double p before ed.
admitted|admit • t • ed|He admitted that he forgot the notebook.|Final stress: double t.
visiting|visit • ing|We are visiting the museum tomorrow.|The final syllable is unstressed; keep one t.
fixed|fix • ed|She fixed the loose button.|Do not double x.`,
    `permitted|permit • t • ed|The teacher permitted another attempt.
committed|commit • t • ed|The group committed to finishing the project.
controlling|control • l • ing|She was controlling the robot with a tablet.
regretted|regret • t • ed|He regretted ignoring the directions.
equipped|equip • p • ed|The studio was equipped with sewing machines.
occurred|occur • r • ed|The change occurred during the experiment.
submitted|submit • t • ed|She submitted the final design.
forgetting|forget • t • ing|He kept forgetting the final step.
traveling|travel • ing|The family is traveling to Chicago.
opening|open • ing|She was opening the supply box.
editing|edit • ing|The writer was editing the paragraph.
limiting|limit • ing|The rule was limiting the number of entries.
slipped|slip • p • ed|The paper slipped off the desk.
spinning|spin • n • ing|The wheel was spinning quickly.
swimming|swim • m • ing|She enjoyed swimming after school.
relaxed|relax • ed|He relaxed after the performance.`);
  add('A8', 'Hard & Soft C/G',
    'C usually spells /s/ before e, i, or y and /k/ before other letters. G can spell /j/ before e, i, or y, but many common words keep hard g. Check the pattern and known exceptions.',
    'E, i, y can soften c or g; g needs an exception check.',
    'City has soft c, while cat has hard c. Giant has soft g, but give and gift keep hard g. Exciting contains soft c, so replacing it with s changes the spelling.',
    { prompt: 'Which statement correctly describes g?', correct: 'It can be soft before e, i, or y, but words such as gift keep hard g.', wrong: ['It is always soft before i.', 'It is always silent before e.', 'It always has the same sound as c.'] },
    `exciting|ex • cit • ing|The final chapter was exciting.|CIT keeps the c that spells /s/.
city|cit • y|The city opened a new art center.|C before i is usually soft.
gentle|gen • tle|The gentle dog rested nearby.|G before e can be soft.
cyclone|cy • clone|The cyclone brought strong winds.|The first c is soft; the second is hard.
recent|re • cent|The recent discovery changed the theory.|C before e is soft.
genuine|gen • u • ine|Her genuine excitement was easy to see.|GEN starts with soft g.
gift|g • i • ft|The gift contained painting supplies.|Gift is a hard-g exception.
courage|cour • age|It took courage to try again.|Final ge keeps soft g.`,
    `citizen|cit • i • zen|Each citizen had a chance to speak.
decimal|dec • i • mal|Write the fraction as a decimal.
central|cen • tral|The central idea appears in the first paragraph.
gesture|ges • ture|Her kind gesture helped a classmate.
generous|gen • er • ous|The generous donation supported the arts.
energy|en • er • gy|Heat transfers energy between objects.
cylinder|cyl • in • der|The cylinder rolled across the floor.
legend|leg • end|The legend explained the map symbols.
logic|log • ic|The argument used clear logic.
magical|mag • ic • al|The magical scene delighted the audience.
gigantic|gi • gan • tic|The gigantic sculpture filled the hall.
giraffe|gir • affe|The giraffe reached the highest leaves.
celebrate|cel • e • brate|We will celebrate the achievement.
capacity|ca • pac • i • ty|The theater reached its full capacity.
agency|a • gen • cy|The agency organized the program.
elegant|el • e • gant|The elegant dress had simple lines.`);
  add('A9', 'Final Stable Syllables',
    'Consonant-le endings such as ble, dle, gle, ple, and tle form an unstressed final syllable. Keep the consonant, l, and final e together. Other recurring endings such as tion and sion are stable spelling chunks to learn as well.',
    'Finish the whole chunk: consonant + l + e.',
    'Table ends in ble; little ends in tle. In little, the short first vowel connects with a double t in the spelling. Do not treat every final /ul/ sound as le: useful ends in the suffix ful.',
    { prompt: 'Which is the complete final chunk in candle?', correct: 'dle', wrong: ['dl', 'del', 'dell'] },
    `candle|can • dle|The candle lit the small room.|Keep DLE together.
little|lit • tle|A little ribbon finished the design.|Keep TT and final LE.
simple|sim • ple|The simple pattern was easy to follow.|Keep PLE together.
possible|pos • si • ble|A second solution was possible.|Keep the final BLE.
struggle|strug • gle|She described her struggle with the difficult task.|Keep GG and final LE.
gentle|gen • tle|Use a gentle touch with the fragile material.|Keep TLE together.
triangle|tri • an • gle|The triangle has three sides.|Keep GLE together.
bundle|bun • dle|Tie the bundle of fabric with string.|Keep DLE together.`,
    `tremble|trem • ble|Her hands began to tremble in the cold.
crumble|crum • ble|The dry cookie began to crumble.
assemble|as • sem • ble|The team will assemble the model.
rectangle|rec • tan • gle|Draw a rectangle around the title.
obstacle|ob • sta • cle|The fallen tree was an obstacle.
particle|par • ti • cle|A tiny particle floated in the water.
sparkle|spar • kle|The beads added sparkle to the dress.
handle|han • dle|Hold the tool by its handle.
sprinkle|sprin • kle|Sprinkle a little salt over the food.
shuffle|shuf • fle|Shuffle the cards before playing.
puzzle|puz • zle|The puzzle required careful thinking.
ripple|rip • ple|A ripple spread across the pond.
tackle|tack • le|We will tackle the hardest problem first.
marble|mar • ble|The marble rolled beneath the chair.
example|ex • am • ple|Give an example that supports the rule.
responsible|re • spon • si • ble|She was responsible for the supplies.`);
  add('A10', 'Prefix Foundations',
    'A prefix adds meaning before a base. Usually keep both the prefix and the base spelling, even when two letters meet. Un means not; re means again; dis can mean not or apart; mis means wrongly; pre means before.',
    'Meaning first: prefix + base. Keep both pieces.',
    'Mis + understood is misunderstood, with one s in mis. Dis + satisfied is dissatisfied, with the s from each part. A prefix boundary explains the letters better than guessing by sound.',
    { prompt: 'Why does dissatisfied have ss?', correct: 'Dis ends with s and satisfied begins with s.', wrong: ['Mis always has two s letters.', 'All prefixes double the next letter.', 'The base satisfied begins with two s letters.'] },
    `misunderstood|mis • understood|She misunderstood the directions.|MIS has one s; keep UNDERSTOOD.
disagreement|dis • agree • ment|Their disagreement led to a discussion.|Keep the double e in AGREE.
unpredictable|un • predict • able|The weather was unpredictable.|UN means not; keep PREDICT.
rewrite|re • write|Rewrite the sentence more clearly.|RE means again; keep WRITE.
dissatisfied|dis • satisfied|The customer was dissatisfied with the repair.|DIS and SATISFIED each supply an s.
preview|pre • view|The preview showed part of the film.|PRE means before; keep VIEW.
incorrect|in • correct|One measurement was incorrect.|IN means not; keep CORRECT.
unnecessary|un • necessary|The extra step was unnecessary.|UN plus the complete NECESSARY.`,
    `misjudge|mis • judge|Do not misjudge someone from one mistake.
reconsider|re • consider|She decided to reconsider the design.
disapprove|dis • approve|The committee may disapprove of the plan.
preheat|pre • heat|Preheat the oven before baking.
unfair|un • fair|The unequal rule seemed unfair.
reconnect|re • connect|Reconnect the cable to the computer.
disrespect|dis • respect|Interrupting the speaker showed disrespect.
misplace|mis • place|Try not to misplace the scissors.
prepayment|pre • pay • ment|The class trip required prepayment.
uncomfortable|un • comfort • able|The tight shoes felt uncomfortable.
irregular|ir • regular|The irregular shape had unequal sides.
immature|im • mature|The immature plant needed more time.
illogical|il • logical|The explanation seemed illogical.
incomplete|in • complete|The incomplete model lacked a roof.
disservice|dis • service|Hiding useful feedback does a disservice to the learner.
misleading|mis • lead • ing|The misleading headline omitted key facts.`);
  add('A11', 'Suffix Foundations',
    'Find the base before adding a suffix. Decide whether to keep or drop silent e, double a consonant, or change consonant-y to i. Keep y before ing. The suffixes ful and ment are complete chunks.',
    'Base first; choose the change; attach the whole ending.',
    'Happy + ness becomes happiness, but carry + ing becomes carrying. Safe + ly keeps e. Ful always has one l as a suffix, even when the base ends in l: skillful.',
    { prompt: 'Why does carrying keep y?', correct: 'Keep y before the suffix ing.', wrong: ['Every suffix keeps y.', 'The base is carri.', 'Ing starts with a consonant.'] },
    `safely|safe • ly|Use the sewing machine safely.|Keep e before ly.
happier|happi • er|She felt happier after solving the problem.|Change happy's y to i before er.
studied|studi • ed|She studied the diagram before answering.|Change study's y to i before ed.
carrying|carry • ing|He was carrying the heavy box.|Keep y before ing.
happiness|happi • ness|The reunion brought happiness.|Change y to i, then add ness.
beautiful|beauti • ful|The beautiful fabric caught the light.|Keep BEAUTI and the one-l suffix FUL.
achievement|achieve • ment|The completed project was an achievement.|Keep e before ment.
successful|success • ful|The successful performance earned applause.|Keep SUCCESS; FUL has one l.`,
    `easily|easi • ly|She easily found the missing clue.
heavily|heavi • ly|The heavily loaded wagon moved slowly.
friendliness|friendli • ness|Her friendliness welcomed the new student.
carefully|care • ful • ly|Measure carefully before cutting.
enjoyment|enjoy • ment|The class found enjoyment in the project.
hopeful|hope • ful|She felt hopeful about the next attempt.
reliability|reli • abil • ity|The tests measured the machine's reliability.
studying|study • ing|He was studying the map.
drying|dry • ing|The paint was drying in the sun.
loneliness|loneli • ness|The story described the character's loneliness.
amazement|amaze • ment|She watched the display in amazement.
peaceful|peace • ful|The peaceful garden was quiet.
usefulness|use • ful • ness|The class discussed the tool's usefulness.
employment|employ • ment|The training prepared her for employment.
readiness|readi • ness|The checklist measured readiness for the trip.
playfulness|play • ful • ness|The puppy's playfulness made us laugh.`);
  add('A12', 'Plurals & Possessives',
    'A plural tells how many; a possessive tells who owns something. Most plurals add s, while s, x, z, ch, and sh endings often add es. Consonant-y usually changes to ies. Singular owners usually add apostrophe-s; regular plural owners add an apostrophe after s.',
    'How many? Who owns it? Answer that before adding letters or marks.',
    'One teacher owns the notes: teacher’s. Several teachers own the room: teachers’. Countries is a plural, not country’s. Vowel-y keeps y in days; some o and f endings need word-specific knowledge.',
    { prompt: 'Which form means notes belonging to several teachers?', correct: "teachers'", wrong: ["teacher's", 'teachers', 'teacheres'] },
    `families|famil • ies|Several families attended the exhibition.|Consonant-y changes to ies.
countries|countr • ies|The map compares three countries.|Keep COUNTR, then IES.
heroes|hero • es|The stories describe several heroes.|Hero is one o-ending word that adds es.
teacher's|teacher • 's|The teacher's notebook was on her desk.|One teacher owns the notebook.
teachers'|teachers • '|The teachers' meeting included six teachers.|Several teachers: apostrophe after s.
children's|children • 's|The children's artwork filled the hallway.|Children is already plural; add apostrophe-s.
classes|class • es|Two classes visited the museum.|Add es after ss.
days|day • s|The project took three days.|Vowel-y keeps y before s.`,
    `libraries|librar • ies|The libraries offered free workshops.
foxes|fox • es|Two foxes crossed the field.
wishes|wish • es|The card listed her birthday wishes.
matches|match • es|The coach scheduled two matches.
potatoes|potato • es|The recipe needed three potatoes.
tomatoes|tomato • es|The tomatoes ripened in the garden.
radios|radio • s|The radios played different stations.
roofs|roof • s|The roofs survived the storm.
leaves|lea • ves|The leaves turned gold in autumn.
wolves|wol • ves|The wolves traveled together.
student's|student • 's|One student's drawing won the prize.
students'|students • '|The students' projects were displayed together.
women's|women • 's|The women's team won the championship.
puppies|pupp • ies|The puppies slept beside their mother.
journeys|journey • s|Their journeys took them to different places.
stories|stor • ies|The stories shared a common theme.`);
  add('A13', 'Homophones',
    'Homophones sound alike but have different spellings and meanings. Use the sentence to choose the meaning first, then retrieve the matching spelling. Check common confused words, even when they are not exact homophones in every accent.',
    'Same sound? Let the sentence choose the spelling.',
    'Their shows belonging; there names a place; they’re means they are. Principal can name a school leader; principle is a rule or belief. Affect is commonly a verb and effect commonly a noun, with exceptions.',
    { prompt: 'Choose the word meaning a rule or belief.', correct: 'principle', wrong: ['principal', 'principel', 'prinsipal'] },
    `their|their|Their designs used recycled fabric.|THEIR shows belonging.
there|there|Place the supplies over there.|THERE points to a place.
they're|they • 're|They're preparing for the performance.|THEY'RE expands to they are.
principal|prin • ci • pal|The principal welcomed the new students.|The school leader ends in PAL.
principle|prin • ci • ple|Fairness is an important principle.|A rule or belief ends in PLE.
affect|af • fect|The cold weather can affect the paint.|Here AFFECT is the action.
effect|ef • fect|The new lighting had a dramatic effect.|Here EFFECT names the result.
complement|com • ple • ment|The blue scarf will complement the coat.|Here COMPLEMENT means complete or go well with.`,
    `compliment|com • pli • ment|She gave the artist a compliment about the painting.
stationary|sta • tion • ar • y|The bicycle stayed stationary during the repair.
stationery|sta • tion • er • y|She bought stationery for writing letters.
weather|weath • er|The weather changed before the picnic.
whether|wheth • er|Decide whether the evidence supports the claim.
peace|p • ea • ce|The agreement brought peace to the region.
piece|p • ie • ce|Cut one piece of fabric for the sleeve.
allowed|al • low • ed|Students were allowed to use the studio.
aloud|a • loud|Read the poem aloud to the group.
brake|br • a • ke|Press the brake to stop the bicycle.
break|br • ea • k|Take a short break after the lesson.
waist|w • ai • st|Measure the waist before sewing the skirt.
waste|w • a • ste|Do not waste the remaining fabric.
course|c • our • se|She enrolled in a sewing course.
coarse|c • oar • se|The coarse fabric felt rough.
patient|pa • tient|Please be patient while the paint dries.`);
  add('A14', 'Irregular Spellings',
    'Map the regular parts of a word and identify the exact unexpected letters. Use a memory cue that preserves the real letter sequence, then cover the word and retrieve it. A funny sentence helps only if it reminds you of the correct letters.',
    'Find the surprise, remember it exactly, then spell without looking.',
    'Necessary has one c and two s letters. Wednesday keeps the written WED even when the d is not clearly heard. Never label the whole word random when some of its patterns are regular.',
    { prompt: 'Which reminder preserves necessary correctly?', correct: 'One c and two s letters.', wrong: ['Two c letters and one s.', 'Leave out the second e.', 'Spell only the letters you hear clearly.'] },
    `necessary|nec • es • sar • y|A ruler is necessary for accurate measurements.|One Collar, two Sleeves: one c, two s.
Wednesday|Wed • nes • day|Our next lesson is Wednesday.|Remember WED before NES before DAY.
February|Feb • ru • ar • y|The exhibit opens in February.|Keep the first r after FEB.
because|be • cause|She revised the plan because it did not fit.|BE plus CAUSE keeps au.
Tennessee|Ten • nes • see|Nashville is the capital of Tennessee.|TEN • NES • SEE keeps nn, ss, and ee.
calendar|cal • en • dar|Mark the date on the calendar.|The ending is DAR, not DER.
rhythm|rh • y • thm|The drummer kept a steady rhythm.|Keep RH, Y, and THM in order.
weird|w • ei • rd|The story had a weird ending.|WEIRD keeps ei.`,
    `island|is • land|The island had a sheltered harbor.
answer|an • swer|Explain how you found the answer.
receipt|re • ceipt|Keep the receipt from the purchase.
doubt|d • ou • bt|The new evidence removed her doubt.
subtle|sub • tle|A subtle change improved the design.
honest|hon • est|Give an honest description of the result.
knowledge|know • ledge|The project expanded her knowledge.
daughter|daugh • ter|His daughter painted the mural.
business|busi • ness|The business sold handmade clothing.
friend|fr • ie • nd|Her friend helped measure the fabric.
foreign|for • eign|The museum displayed foreign coins.
height|h • eigh • t|Measure the height of the model.
straight|str • aigh • t|Draw a straight line along the ruler.
ancient|an • cient|The class studied an ancient settlement.
muscle|mus • cle|The muscle contracts to move the arm.
language|lan • guage|The poem used vivid language.`);
  add('A15', 'Greek & Latin Roots',
    'Many academic words contain Greek or Latin roots and affixes. Knowing a root connects spelling with meaning across a family: port means carry, struct means build, and graph relates to writing. Verify the whole word; families can change pronunciation.',
    'One root, many relatives: carry the spelling and meaning together.',
    'Transport and transportation share port. Photograph and photography share graph, even though the stress changes. A spelling chunk is not always a separate spoken syllable.',
    { prompt: 'Which meaning connects transport and portable?', correct: 'Carry.', wrong: ['Write.', 'Look.', 'Hear.'] },
    `transportation|trans • port • ation|Public transportation connects neighborhoods.|PORT means carry; keep it before ATION.
construction|con • struct • ion|The construction created a new library.|STRUCT means build.
biography|bio • graph • y|The biography described the artist's life.|BIO is life; GRAPH relates to writing.
photograph|photo • graph|The photograph captured the performance.|PHOTO is light; GRAPH relates to writing.
prediction|pre • dict • ion|The prediction matched the later result.|PRE is before; DICT relates to saying.
inspection|in • spect • ion|The inspection found a loose wire.|SPECT relates to looking.
audience|audi • ence|The audience listened to the speech.|AUD relates to hearing.
geography|geo • graph • y|The geography explains where rivers flow.|GEO is earth; GRAPH relates to writing.`,
    `portable|port • able|The portable lamp fit in her bag.
reconstruction|re • con • struct • ion|The reconstruction showed the damaged building's design.
autograph|auto • graph|The performer signed an autograph.
microphone|micro • phone|The microphone made her voice easier to hear.
telephone|tele • phone|The telephone rang during dinner.
submarine|sub • marine|The submarine traveled beneath the water.
spectator|spect • ator|Each spectator watched the contest.
dictation|dict • ation|The dictation included a complete sentence.
aquarium|aqu • arium|The aquarium contained colorful fish.
geology|geo • logy|Geology examines rocks and Earth's history.
biology|bio • logy|Biology studies living things.
credible|cred • ible|The credible source explained its evidence.
audible|aud • ible|Her voice was clearly audible.
visible|vis • ible|The moon was visible through the clouds.
interruption|inter • rupt • ion|The interruption delayed the presentation.
structure|struct • ure|The structure supported the roof.`);
  add('A16', 'Advanced Vowel Patterns',
    'Advanced words combine vowel teams, vowel-r patterns, and unstressed vowels. Schwa is a quiet vowel sound that may be written with different vowel letters. Related words, known chunks, and exact memory cues help recover the spelling.',
    'Quiet does not mean missing: keep every written vowel.',
    'Receive keeps cei. The i-before-e saying has many exceptions and cannot choose every word. Separate keeps a after SEP; a related word such as separation can make parts easier to notice.',
    { prompt: 'What should you do with a quiet vowel in a long word?', correct: 'Use a related word or known chunk to recover its written letter.', wrong: ['Always delete it.', 'Always write u.', 'Use i-before-e for every vowel.'] },
    `receive|re • ceive|You will receive the schedule tomorrow.|RECEIVE keeps cei.
ceiling|ceil • ing|The ceiling was painted blue.|CEIL keeps ei after c.
separate|sep • ar • ate|Separate the dark fabric from the light fabric.|There is A RAT in sepARATe.
ordinary|or • di • nar • y|The ordinary object became a symbol.|Do not replace the middle i with a.
fortunate|for • tun • ate|We were fortunate to find the notebook.|Keep TUN, then ATE.
conscience|con • science|Her conscience told her to admit the mistake.|CON plus the exact chunk SCIENCE.
guarantee|guar • an • tee|The store will guarantee the repair.|GUAR • AN • TEE keeps the quiet a.
temperature|tem • per • a • ture|The temperature rose during heating.|Keep PER and A before TURE.`,
    `deceive|de • ceive|The misleading picture could deceive the viewer.
perceive|per • ceive|People may perceive the same scene differently.
protein|pro • tein|Beans provide protein.
caffeine|caf • feine|The drink contained caffeine.
neighbor|neigh • bor|Our neighbor helped with the project.
weight|w • eigh • t|Measure the weight of the object.
leisure|lei • sure|She paints during her leisure time.
relief|re • lief|Finishing the work brought relief.
belief|be • lief|The belief influenced the character's choice.
efficient|ef • fi • cient|The efficient design used less material.
sufficient|suf • fi • cient|We had sufficient evidence for the claim.
deliberate|de • lib • er • ate|It was a deliberate choice, made after careful thought.
category|cat • e • gor • y|Place the item in the correct category.
desperate|des • per • ate|The character made a desperate attempt to escape.
average|av • er • age|Calculate the average of the measurements.
vegetable|veg • e • ta • ble|A carrot is a vegetable.`);
  add('A17', 'Multi-Syllable Encoding Mastery',
    'Say the whole word naturally, find its meaningful parts, and map its written chunks. Spell every part, including quiet vowels. Then read what you wrote and check the meaning, syllables, suffix, and unexpected letters.',
    'Hear it → understand it → map every part → spell → check.',
    'Different keeps the middle er even when speech compresses it. Unpredictable is un + predict + able. A useful chunk map preserves every letter; it does not have to imitate exaggerated pronunciation.',
    { prompt: 'What best prevents differnt for different?', correct: 'Keep the written ER chunk even when it sounds quiet.', wrong: ['Speak faster and omit quiet parts.', 'Add a random vowel at the end.', 'Ignore the word family.'] },
    `important|im • por • tant|Evidence is important when defending an idea.|IM • POR • TANT: do not lose TANT.
different|dif • fer • ent|The characters made different choices.|DIFFER plus ENT keeps the quiet er.
fortunate|for • tun • ate|We were fortunate to find the missing notebook.|FOR • TUN • ATE keeps all parts.
separate|sep • ar • ate|Separate the materials before the experiment.|Remember A RAT inside sepARATe.
unpredictable|un • predict • able|The ending was unpredictable but believable.|UN plus PREDICT plus ABLE.
disagreement|dis • agree • ment|The disagreement revealed a deeper conflict.|DIS plus AGREE plus MENT keeps ee.
transportation|trans • port • ation|Transportation connects the rural towns.|TRANS • PORT • ATION keeps port.
stationary|sta • tion • ar • y|The bicycle remained stationary during the repair.|AR before Y means staying still.`,
    `environment|en • vi • ron • ment|The environment changed after the flood.
independent|in • de • pend • ent|The independent researcher checked the evidence.
considerable|con • sid • er • able|The repair required considerable effort.
opportunity|op • por • tun • ity|The contest offered an opportunity to learn.
immediately|im • me • di • ate • ly|Drain the rice immediately after cooking.
explanation|ex • plan • ation|Her explanation included each step.
observation|ob • serv • ation|Record one observation from the experiment.
communication|com • mun • ic • ation|Clear communication helped the team.
significant|sig • nif • ic • ant|The discovery was significant to the community.
meticulous|me • tic • u • lous|Her meticulous stitching kept every seam neat.
responsibility|re • spon • si • bil • ity|Caring for the supplies was her responsibility.
embarrassment|em • bar • rass • ment|He felt embarrassment after forgetting the line.
recommendation|re • com • mend • ation|The librarian offered a recommendation.
occasionally|oc • ca • sion • al • ly|She occasionally changed the design.
accommodation|ac • com • mod • ation|The accommodation gave her extra working time.
understanding|under • stand • ing|The discussion deepened her understanding.`);
  const codes = lessons.map(l => l.code);
  if (codes.length !== 18 || new Set(codes).size !== 18) throw new Error('The Star Speller registry is incomplete.');
  window.STAR_LESSONS = lessons;
})();
