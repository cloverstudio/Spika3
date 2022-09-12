import { useRef, useEffect, useState } from "react";

type useIsInViewportProps = {
    elementRef: React.MutableRefObject<undefined>;
    isInViewPort: boolean;
};

export default function useIsInViewport(): useIsInViewportProps {
    const elementRef = useRef();
    const [isInViewPort, setIsInViewPort] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const isInViewPortNew = !!entries[0]?.isIntersecting;
            if (isInViewPortNew !== isInViewPort) {
                setIsInViewPort(isInViewPortNew);
            }
        });

        elementRef.current && observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [isInViewPort]);

    return { elementRef, isInViewPort };
}
