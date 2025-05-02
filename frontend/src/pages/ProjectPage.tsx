import {AnimatePresence, motion} from "framer-motion";
import {TextAppear} from "../components/TextAppear.tsx";
import {useLocation, useNavigate, useParams} from "react-router";
import {useProvider} from "../hook/useProvider.ts";
import {ProjectsProvider} from "../providers/ProjectsProvider.ts";
import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import {ArrowUp} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


function getSlugFromLocation() {
    const location = useLocation();
    const params = useParams();
    return params.slug || location.pathname.split("/").pop();
}

export default function ProjectPage() {


    const slug  = getSlugFromLocation()
    const [response, fetchProject, loading] = useProvider(ProjectsProvider,'getProject', null, true)
    const navigation = useNavigate()
    const project = response || null

    const [openImage, setOpenImage] = useState(false);
    const [indexImage, setIndexImage] = useState(0);
    const slides = project?.images.filter((f: {type:string})=> f.type.startsWith('image/'))
        .map((img : {url:string, filename : string}) => ({
        src: img.url,
        alt: img.filename,
    })) || [];

    const openLightbox = (idx:number) => {
        console.log("open lightbox")
        setIndexImage(idx);
        setOpenImage(true);
    };


    useEffect(() => {
        if(slug == null || slug.length == 0) return
        fetchProject(slug)
    },[slug])


    return (
        <>
            <AnimatePresence>
                {(!loading && project) && <motion.div className="bg-zinc-900 text-white h-screen overflow-y-auto p-24" key={slug}>
                    <div
                    >
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-6">
                                <TextAppear delay={0.8} delayExit={0.2} >
                                    <button onClick={()=>navigation("/")} className="text-cyan-400 flex gap-2 items-center cursor-pointer">Retour <ArrowUp size={15}/></button>
                                </TextAppear>
                                <div className="space-y-2">
                                    <TextAppear delay={0.8} delayExit={0.2} >
                                        <h1 className="text-5xl">{project.title}</h1>
                                    </TextAppear>
                                </div>

                                <div className="text-zinc-400 text-sm">
                                    <TextAppear delay={1} delayExit={0} >
                                     <span>
                                         Publié le {new Date(project.date).toLocaleDateString("fr-FR")}
                                     </span>
                                    </TextAppear>
                                </div>
                                <div className="text-zinc-400 text-sm">
                                    <TextAppear delay={1} delayExit={0} >
                                     {
                                        project.technologies.map((tech : {name:string, logo:{url:string}}) => (
                                            <span key={tech.name} className="flex gap-4 items-center mb-4">
                                                <img src={tech.logo.url} alt={tech.name} className="w-6 h-6"/>
                                                {tech.name}
                                            </span>
                                        ))
                                     }
                                    </TextAppear>
                                </div>

                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1, transition: {delay: 1.2, duration: 1} }}
                                    exit={{opacity: 0, transition: {delay: 0, duration: 0.3} }}
                                    className="prose prose-invert markdown-content max-w-none text-zinc-100 mt-4"
                                >
                                    <ReactMarkdown>
                                        {project.content}
                                    </ReactMarkdown>
                                </motion.div>
                            </div>


                            <motion.div className="space-y-6"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1, transition: {delay: 1, duration: 1} }}
                                        exit={{opacity: 0, transition: {delay: 0, duration: 0.3} }}
                            >
                                {project.images.map((img : any, idx : number) =>
                                    img.type.startsWith('image/') ? (
                                        <img
                                            key={'img-'+idx}
                                            src={img.url}
                                            alt={img.filename}
                                            onClick={() => openLightbox(idx)}
                                            className="transition-transform cursor-pointer duration-300"
                                        />
                                    ) : img.type.startsWith('video/') ? (
                                        <video
                                            key={'video'+idx}
                                            src={img.url}
                                            controls
                                            className="transition-transform duration-300"
                                        />
                                    ) : null
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>}


            </AnimatePresence>
            <Lightbox
                key={slug}
                open={openImage}
                close={() => setOpenImage(false)}
                slides={slides}
                index={indexImage}
            />
        </>
    );
}
