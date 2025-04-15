"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import VerticalCard from "@/Components/Cards/VerticleCard";
import FilterForm from "@/Components/AllPropertyUi/FilterForm";
import { useRouter } from "next/router";
import GridCard from "@/Components/AllPropertyUi/GridCard";
import AllPropertieCard from "@/Components/AllPropertyUi/AllPropertieCard";
import { getPropertyListApi } from "@/store/actions/campaign";
import CustomHorizontalSkeleton from "@/Components/Skeleton/CustomHorizontalSkeleton";
import { languageData } from "@/store/reducer/languageSlice";
import { useSelector } from "react-redux";
import NoData from "@/Components/NoDataFound/NoData";
import { categoriesCacheData } from "@/store/reducer/momentSlice";
import Layout from "../Layout/Layout";
import { translate } from "@/utils/helper";

const City = () => {
  const [grid, setGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [CategoryListByPropertyData, setCategoryListByPropertyData] = useState(
    []
  );

  const [filterData, setFilterData] = useState({
    propType: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    postedSince: "",
    selectedLocation: null,
    facilitiesIds: [],
  });
  const [total, setTotal] = useState();
  const [offsetdata, setOffsetdata] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load
  const limit = 9;

  const router = useRouter();

  const city = router.query;
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;

  const lang = useSelector(languageData);
  const Categorydata = useSelector(categoriesCacheData);

  useEffect(() => {}, [lang]);
  useEffect(() => {}, [grid]);

  const fetchProperties = (offset) => {
    // Determine the value for the postedSince parameter based on filterData.postedSince
    let postedSinceValue = "";
    if (filterData.postedSince === "yesterday") {
      postedSinceValue = "1";
    } else if (filterData.postedSince === "lastWeek") {
      postedSinceValue = "0";
    }
    setIsLoading(true);

    getPropertyListApi({
      city: city.slug,
      offset: offsetdata.toString(),
      limit: limit.toString(),
      category_id: filterData ? filterData?.category : "",
      offset: offset.toString(),
      limit: limit.toString(),
      property_type: filterData ? filterData?.propType : "",
      max_price: filterData ? filterData?.maxPrice : "",
      min_price: filterData ? filterData?.minPrice : "",
      posted_since: postedSinceValue, // Set the postedSince parameter
      parameter_id: filterData ? filterData?.facilitiesIds : "",
      onSuccess: (response) => {
        const propertyData = response.data;
        setIsLoading(false);
        setCategoryListByPropertyData((prevData) => [
          ...prevData,
          ...propertyData,
        ]);
        setTotal(response.total);
        setHasMoreData(propertyData.length === limit);
        if (propertyData.length > 0) {
          setCateName(propertyData[0].category.category);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        console.log(error);
      },
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Ensure that the input value is a positive number
    if (type === "number") {
      const sanitizedValue = Math.max(0, parseInt(value));
      setFilterData({
        ...filterData,
        [name]: sanitizedValue,
      });
    } else {
      setFilterData({
        ...filterData,
        [name]: value,
      });
    }
  };

  const handleTabClick = (tab) => {
    const propTypeValue = tab === "sell" ? 0 : 1;
    setFilterData({
      ...filterData,
      propType: propTypeValue,
    });
  };
  const handlePostedSinceChange = (e) => {
    setFilterData({
      ...filterData,
      postedSince: e.target.value,
    });
  };
  const handleFacilityChange = (event, facilityId) => {
    const isChecked = event.target.checked;

    // Get the current facilities from filterData and ensure it's a string
    const currentFacilities = filterData.facilitiesIds
      ? String(filterData.facilitiesIds).split(",").filter(Boolean) // Ensure it's a string and split
      : [];

    let updatedFacilities;

    if (isChecked) {
      // Add the new facilityId if checked and make sure it's not already in the array
      updatedFacilities = [
        ...new Set([...currentFacilities, facilityId.toString()]),
      ]; // Avoid duplicates
    } else {
      // Remove the facilityId if unchecked
      updatedFacilities = currentFacilities.filter(
        (id) => id !== facilityId.toString()
      );
    }

    // Convert the updated array to a cleaned-up comma-separated string
    const cleanedData = updatedFacilities.join(","); // Join the array with commas

    // Update filterData with the cleaned string of selected IDs
    setFilterData((prev) => ({
      ...prev,
      facilitiesIds: cleanedData, // Join IDs with commas
    }));
  };
  const handleApplyfilter = (e) => {
    e.preventDefault();

    let postedSinceValue = "";
    if (filterData.postedSince === "yesterday") {
      postedSinceValue = "1";
    } else if (filterData.postedSince === "lastWeek") {
      postedSinceValue = "0";
    }

    fetchProperties(0);
  };

  const handleClearFilter = () => {
    setFilterData({
      propType: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      postedSince: "",
      selectedLocation: null,
      facilitiesIds: [],
    });
   fetchProperties(0);
  };


  useEffect(() => {
    if (!router.isReady) return;
    fetchProperties(0);
  }, [isLoggedIn, router.isReady]);

  const handleLoadMore = () => {
    const newOffset = offsetdata + limit;
    setOffsetdata(newOffset);
    fetchProperties(newOffset);
  };

  return (
    <Layout>
      <Breadcrumb
        title={
          city.slug
            ? `${translate("propertiesListedIn")} ${city.slug} `
            : `No Properties in ${city.slug}`
        }
      />

      <div id="all-prop-containt">
        <div className="all-properties container">
          <div className="row " id="main-all-prop">
            <div className="col-12 col-md-12 col-lg-3">
              <FilterForm
                filterData={filterData}
                getCategories={Categorydata}
                handleInputChange={handleInputChange}
                handleTabClick={handleTabClick}
                handlePostedSinceChange={handlePostedSinceChange}
                cityName={city.slug}
                handleApplyfilter={handleApplyfilter}
                handleClearFilter={handleClearFilter}
                setFilterData={setFilterData}
                handleFacilityChange={handleFacilityChange}
              />
            </div>
            <div className="col-12 col-md-12 col-lg-9">
              <div className="all-prop-rightside">
                {CategoryListByPropertyData &&
                CategoryListByPropertyData.length > 0 ? (
                  <GridCard total={total} setGrid={setGrid} grid={grid} />
                ) : null}
                {CategoryListByPropertyData &&
                CategoryListByPropertyData.length > 0 ? (
                  // Row cards
                  !grid ? (
                    <div className="all-prop-cards" id="rowCards">
                      {isLoading
                        ? // Show skeleton loading when data is being fetched
                          Array.from({ length: 8 }).map((_, index) => (
                            <div className="col-sm-12  loading_data" key={index}>
                              <CustomHorizontalSkeleton />
                            </div>
                          ))
                        : CategoryListByPropertyData.map((ele) => (
                            <Link
                              href={`/properties-details/${ele.slug_id}`}
                              passHref
                              key={ele.slug_id}
                            >
                              <AllPropertieCard ele={ele} />
                            </Link>
                          ))}
                    </div>
                  ) : (
                    // Column cards
                    <div id="columnCards">
                      <div className="row" id="all-prop-col-cards">
                        {CategoryListByPropertyData.map((ele, index) => (
                          <div
                            className="col-12 col-md-6 col-lg-4"
                            key={ele.slug_id}
                          >
                            <Link
                              href={`/properties-details/${ele.slug_id}`}
                              passHref
                            >
                              <VerticalCard ele={ele} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="noDataFoundDiv">
                    <NoData />
                  </div>
                )}

                {CategoryListByPropertyData &&
                CategoryListByPropertyData.length > 0 &&
                hasMoreData ? (
                  <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                    <button className="loadMore" onClick={handleLoadMore}>
                      {translate("loadmore")}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default City;
