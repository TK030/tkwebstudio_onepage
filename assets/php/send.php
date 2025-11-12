<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

// ===== .env laden =====
$envPath = __DIR__ . '/../../.env';

function parse_dotenv($path) {
    $data = [];
    if (!file_exists($path)) return $data;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (strpos($line, '=') === false) continue;
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        // verwijder quotes
        if ((substr($val, 0, 1) === '"' && substr($val, -1) === '"') || 
            (substr($val, 0, 1) === "'" && substr($val, -1) === "'")) {
            $val = substr($val, 1, -1);
        }
        $data[$key] = $val;
    }
    return $data;
}

$dotEnv = parse_dotenv($envPath);

function env($key, $fallback = null) {
    global $dotEnv;
    $val = getenv($key);
    if ($val !== false) return $val;
    return $dotEnv[$key] ?? $fallback;
}

// ===== Validatie =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Ongeldige methode.');
}

$name = trim($_POST['naam'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['onderwerp'] ?? '');
$message = trim($_POST['bericht'] ?? '');

if (!$name || !$email || !$message) {
    die('Vul alle verplichte velden in.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die('Ongeldig e-mailadres.');
}

// ===== PHPMailer configuratie =====
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = env('SMTP_HOST');
    $mail->SMTPAuth   = true;
    $mail->Username   = env('SMTP_USERNAME');
    $mail->Password   = env('SMTP_PASSWORD');
    $mail->SMTPSecure = env('SMTP_SECURE');
    $mail->Port       = (int)env('SMTP_PORT');
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(env('FROM_EMAIL'), env('FROM_NAME'));
    $mail->addAddress(env('TO_EMAIL'));
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = $subject ? "Contact via website: $subject" : "Nieuw contactbericht van $name";

    // ===== Mooie HTML body =====
    $mail->Body = "
    <!DOCTYPE html>
    <html lang='nl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .content { padding: 30px 20px; color: #333333; line-height: 1.6; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: 600; color: #667eea; margin-bottom: 5px; display: block; }
            .field-value { background: #f9f9f9; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
            .footer a { color: #667eea; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>📩 Nieuw Contactbericht</h1>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='field-label'>👤 Naam</span>
                    <div class='field-value'>" . htmlspecialchars($name) . "</div>
                </div>
                <div class='field'>
                    <span class='field-label'>📧 E-mail</span>
                    <div class='field-value'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></div>
                </div>";
    
    if ($subject) {
        $mail->Body .= "
                <div class='field'>
                    <span class='field-label'>📝 Onderwerp</span>
                    <div class='field-value'>" . htmlspecialchars($subject) . "</div>
                </div>";
    }
    
    $mail->Body .= "
                <div class='field'>
                    <span class='field-label'>💬 Bericht</span>
                    <div class='field-value'>" . nl2br(htmlspecialchars($message)) . "</div>
                </div>
            </div>
            <div class='footer'>
                Verzonden via <a href='https://tkwebstudio.nl'>TK Webstudio</a> contactformulier
            </div>
        </div>
    </body>
    </html>
    ";

    // Plain text fallback
    $mail->AltBody = "Nieuw contactbericht\n\n"
                   . "Naam: $name\n"
                   . "E-mail: $email\n"
                   . ($subject ? "Onderwerp: $subject\n" : "")
                   . "\nBericht:\n$message\n";

    $mail->send();

    // Redirect naar success pagina
    header('Location: ./success.html');
    exit;

} catch (Exception $e) {
    echo '<!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fout bij verzenden</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px; text-align: center; }
            .error { background: #fff; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .error h1 { color: #e74c3c; }
            .error p { color: #555; }
            .error a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: #fff; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="error">
            <h1>⚠️ Verzenden mislukt</h1>
            <p>' . htmlspecialchars($mail->ErrorInfo) . '</p>
            <a href="../../index.html#contact">← Terug naar contact</a>
        </div>
    </body>
    </html>';
}