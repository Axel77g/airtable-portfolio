import { useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Heart, Plus} from "lucide-react";
import { cn } from "../lib/utils";
import {useNavigate} from "react-router";
import {TextAppear} from "./TextAppear.tsx";


const transition = {
    //inertia
    type: "spring", bounce: 0,
    duration: 1.2,
}

const variants = {
    enter: (direction : number) => ({
        x: direction > 0 ? '100vw' : '0vw',
        width: '0vw'
    }),
    center: {
        x: '0vw',
        width: '100vw',
        transition,
    },
    exit: (direction : number) => ({
        x: direction > 0 ? '0vw' : '100vw' ,
        width: '0vw',
        transition,
    }),
};

export function Slider(props:{projects : any, handleToggleLike : (current : {slug: string, liked: boolean}) => void, onLast : () => void}) {
    const [[index, direction], setIndex] = useState([0, 0]);
    const {projects} = props;
    const paginate = (newDirection : number) => {
        const newIndex = index + newDirection;
        if(newIndex < 0) return
        else setIndex([newIndex, newDirection]);
        if(newIndex === projects.length - 1) props.onLast()
    };

    const navigation = useNavigate()

    const current = projects[index % projects.length]

    function handleSelect(){
        navigation(`/projects/${current.slug}`)
    }



    return (
        <div className="relative w-full h-[100%] overflow-hidden bg-black" onWheel={()=> handleSelect()}>
            {current && <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute w-full h-full bg-center flex items-center justify-center overflow-hidden before:absolute before:inset-0 before:bg-black/50 before:backdrop-blur-[2px]"
                    style={{backgroundImage: `url(${current.image.url})`, backgroundSize: "auto 100vh"}}
                >
                    <TextAppear>
                        <h1
                            onClick={()=> handleSelect()}
                            className="cursor-pointer text-white font-light relative text-7xl ltext-center whitespace-nowrap transform scale-60"
                        >
                            {current.title}
                        </h1>
                    </TextAppear>

                </motion.div>
            </AnimatePresence>}
            {!current && <div className="absolute w-full h-full flex items-center justify-center h-full">
                <h1 className="text-white text-xl text-center whitespace-nowrap ">
                    Aucun projet corespond a la recherche
                </h1>
            </div>}
            <div className="absolute top-0 left-0 w-1/4 h-full flex items-center pl-[15vw] z-10" onClick={() => paginate(-1)}>
                <motion.div animate={{rotate: 90 * index}}>
                    <Plus size={32} strokeWidth={'1px'} className="text-white cursor-pointer" />
                </motion.div>
            </div>
            <div className="absolute top-0 right-0 w-1/4 h-full flex justify-end items-center pr-[15vw] z-10" onClick={() => paginate(1)}>
                <motion.div animate={{rotate: 90 * index}}>
                    <Plus size={32} strokeWidth={'1px'} className="text-white cursor-pointer" />
                </motion.div>
            </div>

            {
    current && <div className="cursor-pointer absolute top-12 right-12 z-11" onClick={()=> props.handleToggleLike(current)}>
        <motion.div
            whileTap={{ scale: 0.8 }}
            initial={{ scale: 1 }}
            animate={current.liked ? {
                scale: 1.5,
                transition: { 
                    type: "spring", 
                    bounce: 0.5,
                    duration: 0.3
                }
            } : { scale: 1 }}
            whileInView={current.liked ? {
                scale: 1,
                transition: {
                    delay: 0.3,
                    duration: 0.2
                }
            } : {}}
        >
            <Heart 
             
                fill={current.liked ? 'white' : 'transparent'} 
                size={32} 
                strokeWidth={'1px'} 
                className={'text-white'} 
            />
            {current.liked && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                x: [0, (Math.random() - 0.5) * 60],
                                y: [0, (Math.random() - 0.5) * 60],
                                opacity: [1, 0]
                            }}
                            transition={{ 
                                duration: 0.8,
                                ease: "easeOut",
                                type: "tween", // type tween est compatible avec plusieurs keyframes
                                delay: Math.random() * 0.2
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    </div>
}

            <div className="absolute bottom-12 right-12 flex gap-4 z-10 select-none">
                {projects.map((_ : any,  i : number) => (
                    <div
                        key={i}
                        className={cn(
                            "w-14 h-8  backdrop-blur-sm cursor-pointer overflow-hidden",
                            i === index % projects.length && "transform scale-110 ",
                        )}
                        onClick={() => setIndex([i, i > index ? 1 : -1])}
                    >
                        <img
                            src={projects[i].image.url}
                            alt="thumb"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Slider;
