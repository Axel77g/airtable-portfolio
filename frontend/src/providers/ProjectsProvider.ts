import {Provider} from "./Provider.ts";

export class ProjectsProvider extends Provider {

    getProjects(query :  Record<string, string> = {}){
        const queryUrl = new URLSearchParams(query).toString()
        return this.axios.get('/projects?' + queryUrl)
    }

    getProject(slug : string){
        return this.axios.get(`/projects/${slug}`)
    }

    toggleLike(slug : string, dislike : boolean){
        return this.axios.post(`/projects/${slug}/${dislike ? 'dislike' : 'like'}`)
    }

    setPublish(slug : string, unpublish : boolean){
        return this.axios.post(`/projects/${slug}/${unpublish ? 'unpublish' : 'publish'}`)
    }

}