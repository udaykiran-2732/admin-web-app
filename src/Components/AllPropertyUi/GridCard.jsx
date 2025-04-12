"use client"
import { translate } from "@/utils/helper";
import React, { useEffect, useState } from "react";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { RiGridFill } from "react-icons/ri";


const GridCard = (props) => {
    const { total, setGrid, grid } = props;
    // const [isGrid, setIsGrid] = useState(false);

    const toggleGrid = () => {
        setGrid(!grid);
        // setIsGrid(!isGrid);
    };
    useEffect(() => {

    }, [grid])


    return (
        <div className="card">
            <div className="card-body" id="all-prop-headline-card">
                <div>
                    <span>{total && `${total} ${translate("propFound")}`}</span>
                </div>
                <div>
                    <button id="layout-buttons" onClick={toggleGrid}>
                        {grid ? <AiOutlineUnorderedList size={25} /> : <RiGridFill size={25} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GridCard;

