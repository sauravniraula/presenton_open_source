import { useState, useEffect } from "react";

export const useFetchData = () => {
	const [data, setData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/api/presentation-data');
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const result = await response.json();
				setData(result);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	return { data, isLoading };
};

export const fetchData = async () => {
	try {
		const response = await fetch('/api/presentation-data');
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
};