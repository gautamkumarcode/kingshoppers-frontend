import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
	threshold?: number;
	rootMargin?: string;
}

export function useInfiniteScroll(
	callback: () => void,
	options: UseInfiniteScrollOptions = {}
) {
	const { threshold = 0.1, rootMargin = "100px" } = options;
	const [isFetching, setIsFetching] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const targetRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const target = targetRef.current;
		if (!target) return;

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && !isFetching) {
					setIsFetching(true);
					callback();
				}
			},
			{
				threshold,
				rootMargin,
			}
		);

		observerRef.current.observe(target);

		return () => {
			if (observerRef.current && target) {
				observerRef.current.unobserve(target);
			}
		};
	}, [callback, threshold, rootMargin, isFetching]);

	const resetFetching = () => setIsFetching(false);

	return { targetRef, isFetching, resetFetching };
}
