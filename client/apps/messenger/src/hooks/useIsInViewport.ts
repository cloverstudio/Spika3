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
            const isInViewPort = !!entries[0]?.isIntersecting;

            setIsInViewPort(isInViewPort);
        });

        observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, []);

    return { elementRef, isInViewPort };
}
