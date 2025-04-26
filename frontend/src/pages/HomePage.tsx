import Slider from "../components/slider.tsx";
import {useEffect} from "react";
import {axiosInstance} from "../providers/axiosInstance.ts";
import {ProjectsProvider} from "../providers/ProjectsProvider.ts";
import {useProvider} from "../hook/useProvider.ts";



export function HomePage(){
    const [resultsRequest, fetchProjects, loadingProjects] = useProvider(ProjectsProvider, "getProjects", [], true)
    const projects = resultsRequest.items?.filter(p => p.published) || []
    useEffect(() => {
        fetchProjects()
    }, []);

    async function handleToggleLike(current : {slug : string, liked : boolean}){
        const provider = new ProjectsProvider(axiosInstance)
        const response = await provider.toggleLike(current.slug, current.liked)
        if(response.status == 200) fetchProjects()
    }

    if(loadingProjects && projects?.length == 0) return <div></div>
    return <Slider projects={projects} handleToggleLike={handleToggleLike}/>

}