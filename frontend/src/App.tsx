import {Navigate, Outlet, Route, Routes, useLocation} from "react-router";
import {AnimatePresence, motion} from "framer-motion";
import {JSX, useEffect} from "react";
import {HomePage} from "./pages/HomePage.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import {AdminPage} from "./pages/AdminPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {useProvider} from "./hook/useProvider.ts";
import {AuthProvider} from "./providers/AuthProvider.ts";

function AnimatedRoutes(){
    return <AnimatePresence mode={"wait"}>
        <div className="flex flex-col w-screen h-screen overflow-hidden">
            <PageWrapper path={'/'} >
                <HomePage/>
            </PageWrapper>
            <PageWrapper path={'/projects/:slug'}>
                <ProjectPage/>
            </PageWrapper>
        </div>
    </AnimatePresence>
}

function PrivateRoutes() {
    const [auth, checkAuth, loading] = useProvider(AuthProvider,'getUser', null, true)
    useEffect(() => {
        checkAuth()
    }, []);
    if(loading) return <div>Checking authorization...</div>
    return (
        auth?.email ? <Outlet/> : <Navigate to='/login'/>
    )

}

function PageWrapper(props : {children : JSX.Element,path: string}){
    const isMatch = (path: string, pathname: string) => {
        const pathParts = path.split('/');
        const pathnameParts = pathname.split('/');

        if (pathParts.length !== pathnameParts.length) return false;
        return pathParts.every((part, i) => part.startsWith(':') || part === pathnameParts[i]);
    }
    const isCurrent = isMatch(props.path, useLocation().pathname)

    const transition = {
        duration: 1, ease: [.78,.0,.23,1]
    }

    return <motion.div
        animate={{flex: `0 0 ${isCurrent ? '100%' : '0%'}`}}
        transition={transition}
    >
        {props.children}
    </motion.div>
}

function App() {
    const location = useLocation()
    const hidePortfolio = location.pathname.split('/').pop() === 'admin' || location.pathname.split('/').pop() === 'login'
  return <div>
      <Routes location={location} >
          <Route element={<PrivateRoutes/>}>
            <Route path="/admin" element={<AdminPage/>} />
          </Route>
          <Route path="/login" element={<LoginPage/>} />
      </Routes>
      {!hidePortfolio && <AnimatedRoutes/>}
  </div>
}

export default App
