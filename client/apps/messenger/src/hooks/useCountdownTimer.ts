import { useEffect, useState } from "react";

type CountdownTimerReturnProps = {
    left: number;
    start: () => void;
};

export default function useCountdownTimer(time: number): CountdownTimerReturnProps {
    const [left, setLeft] = useState(time);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (started) {
            const t = setInterval(() => {
                setLeft((left) => {
                    if (left > 0) {
                        return left - 1;
                    }
                });
            }, 1000);

            return () => clearInterval(t);
        }
    }, [started]);

    const start = () => {
        setLeft(time);
        setStarted(true);
    };

    return { left, start };
}
