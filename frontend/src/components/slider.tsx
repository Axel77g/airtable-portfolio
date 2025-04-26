import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Heart, Plus} from "lucide-react";
import { cn } from "../lib/utils";
import {useNavigate} from "react-router";
import {TextAppear} from "./TextAppear.tsx";
import {ProjectsProvider} from "../providers/ProjectsProvider.ts";

const slides = [
    {
        slug: "mon-projet-super-cool",
        published: true,
        liked: false,
        title: "Mon Projet Super Cool",
        like: 128,
        date: new Date("2025-04-20T14:30:00Z"),
        content: "Voici une description fictive de mon projet, super engageante et pleine de détails.",
        images: [
            {
                filename: "image1.jpg",
                url: "/images/image_1.png",
                thumbnails: {
                    small: { url: "https://example.com/images/thumbs/small/image1.jpg" },
                    large: { url: "https://example.com/images/thumbs/large/image1.jpg" },
                    full: { url: "https://example.com/images/thumbs/full/image1.jpg" },
                },
            },
            {
                filename: "image2.jpg",
                url: "https://example.com/images/image2.jpg",
                thumbnails: {
                    small: { url: "https://example.com/images/thumbs/small/image2.jpg" },
                    large: { url: "https://example.com/images/thumbs/large/image2.jpg" },
                    full: { url: "https://example.com/images/thumbs/full/image2.jpg" },
                },
            },
        ],
        image: {
            filename: "image-principale.jpg",
            url: "/images/image_1.png",
            thumbnails: {
                small: { url: "https://example.com/images/thumbs/small/image-principale.jpg" },
                large: { url: "https://example.com/images/thumbs/large/image-principale.jpg" },
                full: { url: "https://example.com/images/thumbs/full/image-principale.jpg" },
            },
        },
    },
    {
        slug: "mon-projet-super-cool-2",
        liked: true,
        published: true,
        title: "Mon Projet Super Cool 2",
        like: 128,
        date: new Date("2025-04-20T14:30:00Z"),
        content: "Voici une description fictive de mon projet, super engageante et pleine de détails.",
        images: [
            {
                filename: "image1.jpg",
                url: "/images/image_2.png",
                thumbnails: {
                    small: { url: "https://example.com/images/thumbs/small/image1.jpg" },
                    large: { url: "https://example.com/images/thumbs/large/image1.jpg" },
                    full: { url: "https://example.com/images/thumbs/full/image1.jpg" },
                },
            },
            {
                filename: "image2.jpg",
                url: "https://example.com/images/image2.jpg",
                thumbnails: {
                    small: { url: "https://example.com/images/thumbs/small/image2.jpg" },
                    large: { url: "https://example.com/images/thumbs/large/image2.jpg" },
                    full: { url: "https://example.com/images/thumbs/full/image2.jpg" },
                },
            },
        ],
        image: {
            filename: "image-principale.jpg",
            url: "/images/image_2.png",
            thumbnails: {
                small: { url: "https://example.com/images/thumbs/small/image-principale.jpg" },
                large: { url: "https://example.com/images/thumbs/large/image-principale.jpg" },
                full: { url: "https://example.com/images/thumbs/full/image-principale.jpg" },
            },
        },
    }
    // Add more slides as needed
];

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

export function Slider(props:{projects : any, handleToggleLike : (current : {slug: string, liked: boolean}) => void}) {
    const [[index, direction], setIndex] = useState([0, 0]);
    const {projects} = props;
    const paginate = (newDirection : number) => {
        if(index + newDirection < 0) return
        else setIndex([index + newDirection, newDirection]);
    };

    const navigation = useNavigate()

    const current = projects[index % projects.length]


    function handleSelect(){
        navigation(`/projects/${current.slug}`)
    }


    return (
        <div className="relative w-full h-[100%] overflow-hidden bg-black" onWheel={()=> handleSelect()}>
            <AnimatePresence initial={false} custom={direction}>
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
            </AnimatePresence>
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

            <div  className="cursor-pointer absolute top-12 right-12 z-11" onClick={(e)=>e.preventDefault()}>
                <Heart onClick={()=> props.handleToggleLike(current)} fill={current.liked ? 'white' : 'transparent'} size={32} strokeWidth={'1px'} className={'text-white'} />
            </div>

            <div className="absolute bottom-12 right-12 flex gap-4 z-10 select-none">
                {projects.map((_, i) => (
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
