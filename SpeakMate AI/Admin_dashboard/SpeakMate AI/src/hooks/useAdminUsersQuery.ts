import { useEffect, useState } from "react";
import { mockUserDetailQuery, mockUsersQuery, type User, type UserDetail } from "../data/adminUsersMock";

/** Mock query hook with a TanStack Query-shaped result. Swap the queryFn later. */
export function useUsersQuery() {
    const [data, setData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refetch = async () => {
        setIsLoading(true);
        try {
            setData(await mockUsersQuery());
            setError(null);
        } catch (reason) {
            setError(reason instanceof Error ? reason : new Error("Unable to load users"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void refetch(); }, []);
    return { data, setData, isLoading, isError: Boolean(error), error, refetch };
}

/** Mock detail query hook; disabled when no user is selected. */
export function useUserDetailQuery(user: User | null) {
    const [data, setData] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let current = true;
        if (!user) { setData(null); return; }
        setIsLoading(true);
        mockUserDetailQuery(user).then((result) => current && setData(result)).finally(() => current && setIsLoading(false));
        return () => { current = false; };
    }, [user]);

    return { data, isLoading };
}
