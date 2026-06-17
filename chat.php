<?php
/* ===========================================================
   chat.php — AI assistant proxy for the portfolio (Hostinger PHP)
   The NVIDIA API key is NEVER in this repo. It is read from an
   environment variable, or from secrets.php (which is .gitignored).
   The browser only ever talks to this file — same origin.
   =========================================================== */

header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no'); // discourage proxy buffering so it streams

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo 'data: ' . json_encode(['error' => 'POST only']) . "\n\n";
  exit;
}

$MODEL = 'z-ai/glm-5.1'; // change to any NVIDIA model id

$SYSTEM = <<<'TXT'
You are "Azeem's Assistant", a friendly, concise AI on the portfolio website of Rayyan
Azeem Syed. You help visitors — mostly recruiters, HR, and potential clients — learn about
Rayyan. Speak warmly and professionally ("Rayyan has…", "He built…"). Keep answers short
(2–5 sentences) unless asked for detail. Only answer questions about Rayyan, his work,
skills, and availability; politely steer back if asked anything unrelated. Never invent
facts beyond what's below; if unsure, suggest they email him. Encourage strong-fit visitors
to reach out.

ABOUT: Final-year B.Tech CSE student; Co-Founder & CEO of HMGenX, leading a team building
full-stack web, mobile & desktop apps and AI software for real clients. Focus: turning ideas
into computer-vision products businesses pay for. ₹60,000+ client revenue from shipped products.

PROJECTS:
- OMR Scanner & Mark Report System (Python, OpenCV, MySQL): real-time JEE/EAMCET OMR grading,
  98.6% accuracy, 2–3 sheets/sec; sold to TWO institutions (₹40,000); Certificate of
  Appreciation from Nakshatra IIT-JEE Academy.
- Plot Map Detection System (Python, YOLOv8, CUDA, OpenCV, PyQt6): GPU engine for Sri
  Bramharamba Real Estate; reads a plot map and returns every plot's coordinates & number;
  99.2% accuracy, ~5,000 plots in 3s (₹20,000).
- Lipi — Bharat Script Transliteration (Flutter, Google ML Kit, OCR): Smart India Hackathon
  2025 app, 11+ Indian scripts, camera OCR, offline models.

EXPERIENCE: Co-Founder/CEO/Lead Developer — HMGenX (2023–present); Front-end Intern —
InLighnX Global (Jul–Sep 2025); Web Dev Intern — Konic Technologies (Apr–Jul 2025).

SKILLS: Python, C, JavaScript, Dart; HTML/CSS, React, Node.js, Flutter, PyQt6, UI/UX;
OpenCV, YOLO, PyTorch, TensorFlow, Pandas, CUDA/GPU, ML Kit; MySQL, Supabase, Firebase,
REST APIs, Git/GitHub, Docker, Linux, Postman.

EDUCATION: B.Tech CSE — RISE Krishna Sai Prakasam, Valluru (expected 2027, SGPA 8.44);
Intermediate MPC — Narayana Junior College (2023, 95.3%); SSC — Narayana EM School (2021, 100%).

HONOURS: Nakshatra certificate; chess medals; district-level Kabaddi. Languages: Urdu
(native), Hindi, Telugu, English.

AVAILABILITY/CONTACT: Open to software developer placements, internships and freelance.
Email ridahuda03@gmail.com · +91 90100 30579 · Kandukur, Andhra Pradesh ·
linkedin.com/in/rayyanazeemsyed · github.com/azeem-web-dev. To hire him, point them to the
contact form on the site or his email.
TXT;

// --- load the key: env var first, then gitignored secrets.php ---
$key = getenv('NVIDIA_API_KEY');
if (!$key && is_file(__DIR__ . '/secrets.php')) { $key = require __DIR__ . '/secrets.php'; }
if (!$key) {
  http_response_code(500);
  echo 'data: ' . json_encode(['error' => 'Server not configured']) . "\n\n";
  exit;
}

// --- read & sanitise the conversation ---
$body = json_decode(file_get_contents('php://input'), true);
$msgs = [];
if (isset($body['messages']) && is_array($body['messages'])) {
  foreach (array_slice($body['messages'], -12) as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    if ($m['role'] !== 'user' && $m['role'] !== 'assistant') continue;
    $msgs[] = ['role' => $m['role'], 'content' => mb_substr((string)$m['content'], 0, 1500)];
  }
}
if (!$msgs) { echo 'data: ' . json_encode(['error' => 'No messages']) . "\n\n"; exit; }

$payload = [
  'model'       => $MODEL,
  'messages'    => array_merge([['role' => 'system', 'content' => $SYSTEM]], $msgs),
  'temperature' => 0.6,
  'top_p'       => 0.95,
  'max_tokens'  => 700,
  'stream'      => true,
];

// --- stream NVIDIA's SSE straight back to the browser ---
@ini_set('zlib.output_compression', '0');
while (ob_get_level() > 0) { @ob_end_flush(); }

$ch = curl_init('https://integrate.api.nvidia.com/v1/chat/completions');
curl_setopt_array($ch, [
  CURLOPT_POST       => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . $key,
    'Content-Type: application/json',
    'Accept: text/event-stream',
  ],
  CURLOPT_POSTFIELDS    => json_encode($payload),
  CURLOPT_WRITEFUNCTION => function ($ch, $data) {
    echo $data; @ob_flush(); @flush();
    return strlen($data);
  },
  CURLOPT_TIMEOUT => 60,
]);
if (curl_exec($ch) === false) {
  echo 'data: ' . json_encode(['error' => 'Upstream error', 'detail' => curl_error($ch)]) . "\n\n";
}
curl_close($ch);
