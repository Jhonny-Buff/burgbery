import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

interface CaptchaLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  width: number;
}

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaptcha(): { code: string; lines: CaptchaLine[] } {
  const code = Array.from({ length: 6 })
    .map(() => CHARSET[Math.floor(Math.random() * CHARSET.length)])
    .join('');

  const lines: CaptchaLine[] = Array.from({ length: 8 }).map(() => ({
    x1: Math.random() * 240,
    y1: Math.random() * 80,
    x2: Math.random() * 240,
    y2: Math.random() * 80,
    stroke: `hsla(${Math.random() * 360}, 70%, 70%, 0.4)`,
    width: Math.random() * 2 + 1,
  }));

  return { code, lines };
}

export function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const textShapes = useMemo(
    () =>
      captcha.code.split('').map((char, idx) => ({
        char,
        rotate: Math.random() * 30 - 15,
        x: 30 + idx * 34 + Math.random() * 6,
        y: 40 + Math.random() * 20,
        color: `hsl(${(idx * 45 + 90) % 360}, 80%, 70%)`,
      })),
    [captcha.code],
  );

  const resetCaptcha = useCallback(() => {
    const next = generateCaptcha();
    setCaptcha(next);
    setUserInput('');
    setIsVerified(false);
    setError('');
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const checkAnswer = useCallback(
    (value: string) => {
      const normalized = value.trim().toUpperCase();
      if (normalized.length === 0) {
        setError('');
        setIsVerified(false);
        onVerify(false);
        return;
      }

      if (normalized === captcha.code) {
        setIsVerified(true);
        setError('');
        onVerify(true);
      } else {
        setIsVerified(false);
        setError('Неверно введён код');
        onVerify(false);
      }
    },
    [captcha.code, onVerify],
  );

  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 space-y-3" data-testid="captcha-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Проверка безопасности</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetCaptcha}
          className="text-zinc-400 hover:text-white p-1 h-auto"
          data-testid="button-refresh-captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg border border-zinc-700 overflow-hidden">
        <svg viewBox="0 0 240 80" role="img" aria-label="captcha" className="w-full h-24">
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.4" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="240" height="80" fill="#0f1013" />
          <rect width="240" height="80" filter="url(#noise)" opacity="0.35" />
          {captcha.lines.map((line, idx) => (
            <line
              key={idx}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.stroke}
              strokeWidth={line.width}
              strokeLinecap="round"
            />
          ))}
          {textShapes.map((shape, idx) => (
            <text
              key={idx}
              x={shape.x}
              y={shape.y}
              fill={shape.color}
              fontSize="32"
              fontWeight="bold"
              transform={`rotate(${shape.rotate} ${shape.x} ${shape.y})`}
              style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}
            >
              {shape.char}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setError('');
          }}
          onBlur={(e) => checkAnswer(e.target.value)}
          placeholder="Введите символы"
          className={`w-full bg-zinc-900 border ${
            error ? 'border-red-500' : 'border-zinc-600'
          } rounded px-3 py-2 text-white tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-orange-500`}
          data-testid="input-captcha-answer"
        />
        {isVerified ? (
          <div className="flex items-center gap-2 text-green-400" data-testid="captcha-verified">
            <Check className="w-5 h-5" />
            <span>Проверка пройдена</span>
          </div>
        ) : (
          error && (
            <p className="text-red-400 text-sm" data-testid="text-captcha-error">
              {error}
            </p>
          )
        )}
      </div>
    </div>
  );
}
