import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

function generateMathProblem(): { question: string; answer: number } {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }
  
  const operationSymbol = operation === '*' ? '×' : operation;
  return { question: `${num1} ${operationSymbol} ${num2} = ?`, answer };
}

export function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [problem, setProblem] = useState(generateMathProblem);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const refreshProblem = useCallback(() => {
    setProblem(generateMathProblem());
    setUserAnswer('');
    setIsVerified(false);
    setError(false);
    onVerify(false);
  }, [onVerify]);

  const checkAnswer = () => {
    const parsed = parseInt(userAnswer, 10);
    if (parsed === problem.answer) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      onVerify(false);
    }
  };

  useEffect(() => {
    if (userAnswer.length > 0 && !isVerified) {
      const parsed = parseInt(userAnswer, 10);
      if (!isNaN(parsed) && parsed === problem.answer) {
        setIsVerified(true);
        setError(false);
        onVerify(true);
      }
    }
  }, [userAnswer, problem.answer, isVerified, onVerify]);

  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700" data-testid="captcha-container">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-300 text-sm">Защита от роботов</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refreshProblem}
          className="text-zinc-400 hover:text-white p-1 h-auto"
          data-testid="button-refresh-captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {isVerified ? (
        <div className="flex items-center gap-2 text-green-400" data-testid="captcha-verified">
          <Check className="w-5 h-5" />
          <span>Проверка пройдена</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-white text-lg font-mono bg-zinc-900 px-4 py-2 rounded" data-testid="text-captcha-question">
              {problem.question}
            </span>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setError(false);
              }}
              onBlur={checkAnswer}
              placeholder="?"
              className={`w-20 bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-600'} rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500`}
              data-testid="input-captcha-answer"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm" data-testid="text-captcha-error">Неверный ответ. Попробуйте ещё раз.</p>
          )}
        </div>
      )}
    </div>
  );
}
