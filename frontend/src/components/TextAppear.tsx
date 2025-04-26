import {JSX} from "react";
import {motion} from "framer-motion";

export function TextAppear(props: {children: JSX.Element, delay?: number, delayExit?:number, [key: string]: any
}) {
    return <div className={'overflow-hidden'}>
        <motion.div
            variants={{
                enter: { opacity: 0, y : '100%' },
                center: { opacity: 1, y: '0%',transition: { duration: 0.4, delay: props?.delay || 0.3,  ease:[.17,.36,.61,.99] } },
                exit: { opacity: 0, y:'-100%', transition: { duration: 0.4, delay: props?.delayExit || 0,  ease: [.17,.36,.61,.99] } }
            }}
            className={'py-1'}
            initial="enter"
            animate="center"
            exit="exit"
        >
            {props.children}
        </motion.div>
    </div>
}