import { useEffect, useState } from "react";

export default function useCountdownTimer(time: number): number {
    const [left, setLeft] = useState(time);

    useEffect(() => {
        const t = setInterval(() => {
            setLeft((left) => {
                if (left > 0) {
                    return left - 1;
                }
            });
        }, 1000);

        return () => clearInterval(t);
    });
    return left;
}
