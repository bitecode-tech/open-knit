import LandingPage from "./LandingPage";
import {usePageContext} from "vike-react/usePageContext";
import type {Data} from "./+data";

export default function Page() {
    const pageContext = usePageContext();
    const {mcpEndpoint} = pageContext.data as Data;

    return <LandingPage mcpEndpoint={mcpEndpoint}/>;
}
