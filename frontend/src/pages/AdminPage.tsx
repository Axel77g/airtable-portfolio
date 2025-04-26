import {ProjectsProvider} from "../providers/ProjectsProvider.ts";
import {useProvider} from "../hook/useProvider.ts";
import {axiosInstance} from "../providers/axiosInstance.ts";
import {usePagination} from "../hook/usePagination.ts";
import {Heart} from "lucide-react";
import {Switch} from "../components/Switch.tsx";
import {useEffect} from "react";

export function AdminPage() {

    const [response, fetchProjects] = useProvider(ProjectsProvider, "getProjects", [], true)
    const [page, pageSize, nextPage, previousPage] = usePagination(response)
    const projects = response.items || []

    async function handleTogglePublish(current : {slug : string, published : boolean}){
        const provider = new ProjectsProvider(axiosInstance)
        const response = await provider.setPublish(current.slug, current.published)
        if (response.status == 200) fetchProjects({page, pageSize, cache:0})
    }

    useEffect(() => {
        fetchProjects({page,pageSize,cache:0})
    }, [page,pageSize]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Gestion des Projets</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project: any) => (
                    <div key={project.slug} className="p-4 border rounded-xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">{project.title}</h2>
                                <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5 text-red-500" />
                                <span>{project.like}</span>
                                </div>
                                </div>
                                <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {project.published ? "Publié" : "Non publié"}
                                </span>
                                <Switch
                                    checked={project.published}
                                    onCheckedChange={(checked) => handleTogglePublish({ slug: project.slug, published: project.published })}
                                />
                        </div>
                    </div>
                ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4 mt-6">
                <button onClick={()=> previousPage()} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Précédent</button>
                <button onClick={()=> nextPage()} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Suivant</button>
            </div>
        </div>
);



}