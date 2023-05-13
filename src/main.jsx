import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom/client'
import Contact, {
    loader as contactLoader,
    action as contactAction,
} from "./routes/contact";
import ErrorPage from "./error-page";
import Root, { loader as rootLoader,  action as rootAction, } from "./routes/root";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import './index.css'
import EditContact,{action as editAction,} from "./routes/edit";
import { action as destroyAction } from "./routes/destroy";
import Index from "./routes/index";
import mqtt from "precompiled-mqtt";


const client = mqtt.connect('wss://random.pigne.org');
const DataReceiver = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const handleData = (topic, value) => {
            let parsedData;
            try {
                parsedData = JSON.parse(value.toString(), (key, value) => {
                    // Handle any special JSON parsing rules here
                    return value;
                });
            } catch (e) {
                console.error(e);
                return;
            }
            setData((prevData) => [...prevData, parsedData]);
        };

        client.on('connect', () => {
            console.log('on est connectés');
            client.subscribe('value/#');
        });

        client.on('message', handleData);

        return () => {
            client.removeListener('message', handleData);
        };
    }, []);
    console.log(data)
    return <Index data={data} />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        loader: rootLoader,
        action: rootAction,
        children: [
            {
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <Index /> },
                    {
                        path: "contacts/:contactId",
                        element: <Contact />,
                        loader: contactLoader,
                        action: contactAction,
                    },
                    /* the rest of the routes */
                ],
            },
            { index: true, element: <Index /> },
            {
                path: "contacts/:contactId",
                element: <Contact />,
                loader: contactLoader,
                action: contactAction,
            },
            {
                path: "contacts/:contactId/edit",
                element: <EditContact />,
                loader: contactLoader,
                action: editAction,
            },
            {
                path: "contacts/:contactId/destroy",
                action: destroyAction,
                errorElement: <div>Oops! There was an error.</div>,
            },
        ],
    },

]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

export default DataReceiver;