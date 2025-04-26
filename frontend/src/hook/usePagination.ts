import {useState} from "react";

export function usePagination(pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}) : [number, number, () => void, () => void]{

    const [page, setPage] = useState(1)

    function nextPage(){
        setPage(page + 1)
    }

    function previousPage(){
        setPage(page - 1)
    }

    return [page, pagination?.pageSize || 10, nextPage, previousPage]
}