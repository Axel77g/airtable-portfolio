import Slider from "../components/Slider.tsx";
import {useEffect, useRef, useState} from "react";
import {axiosInstance} from "../providers/axiosInstance.ts";
import {ProjectsProvider} from "../providers/ProjectsProvider.ts";
import {useProvider} from "../hook/useProvider.ts";
import SearchBar from "../components/SearchBar.tsx";
import {useNavigate} from "react-router";
import {usePagination} from "../hook/usePagination.ts";



export function HomePage(){
    const [search, setSearch] = useState("")
    const lastSearch = useRef<string>(null)
    const [resultsRequest, fetchProjects, loadingProjects] = useProvider(ProjectsProvider, "getProjects", [], true)
    const [page, , nextPage, , setPage] = usePagination(resultsRequest)
    const [projects, setProjects] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if(lastSearch.current == null) return;
        setProjects([])
        if(page != 1) setPage(1)
        else fetch()
    }, [search]);

    useEffect(() => {
        fetch()
    }, [page]);



    useEffect(() => {

        const newProjects = resultsRequest?.items?.filter((p : any) => p.published) || []
        let temp = [
            ...projects,
            ...newProjects
        ]
        // @ts-ignore
        setProjects(temp)
    }, [resultsRequest]);


    const fetch = () => {
        fetchProjects({page, pageSize: 30, s:search})
        lastSearch.current = search
    }


    function handleNextPage(){
        nextPage()
    }

    async function handleToggleLike(current : {slug : string, liked : boolean}){
        const provider = new ProjectsProvider(axiosInstance)
        const response = await provider.toggleLike(current.slug, current.liked)
        if(response.status == 200) fetch()
    }

    if(loadingProjects && projects.length == 0) return <div className={"relative w-full h-[100%] overflow-hidden bg-black"}>
        Chargement
    </div>
    return <div className={"relative h-full"}>
        <div className="absolute top-12 left-12 z-15">
            <SearchBar searchTermDefault={search} onSearch={(search)=>{
                navigate('/')
                setSearch(search)
            }} />
        </div>
        <Slider onLast={handleNextPage} projects={projects} handleToggleLike={handleToggleLike}/>
    </div>

}