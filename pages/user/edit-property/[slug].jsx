"use client"

import React from "react";
// import UserEditProperty from '@/Components/User/UserEditProperty.jsx'
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const UserEditProperty = dynamic(
  () => import('@/Components/User/UserEditProperty.jsx'),
  { ssr: false })
const Index = () => {

    return (
        <>
            <Meta
                title=""
                description=""
                keywords=""
                ogImage=""
                pathName=""
            />
            <UserEditProperty />
        </>
    );
};

export default Index;
