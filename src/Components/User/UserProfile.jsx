"use client"
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic.js";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { Fcmtoken, settingsData } from "@/store/reducer/settingsSlice";
import LocationSearchBox from "@/Components/Location/LocationSearchBox";
import { UpdateProfileApi } from "@/store/actions/campaign";
import { loadUpdateUserData } from "@/store/reducer/authSlice";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { placeholderImage, translate } from "@/utils/helper.js";
import { languageData } from "@/store/reducer/languageSlice";
import Image from "next/image";
import Swal from "sweetalert2";
import { notification } from "antd";
import FirebaseData from "@/utils/Firebase.js";
import withAuth from "../Layout/withAuth.jsx";

const VerticleLayout = dynamic(() => import('../../../src/Components/AdminLayout/VerticleLayout.jsx'), { ssr: false })




const UserProfile = () => {
    const { requestNotificationPermission } = FirebaseData();

    const userData = useSelector((state) => state.User_signup);
    const userProfileData = userData?.data?.data;
    const navigate = useRouter();
    const FcmToken = useSelector(Fcmtoken);
    const [formData, setFormData] = useState({
        fullName: userProfileData?.name,
        email: userProfileData?.email,
        phoneNumber: userProfileData?.mobile,
        address: userProfileData?.address,
        aboutMe: userProfileData?.about_me,
        facebook: userProfileData?.facebook_id,
        instagram: userProfileData?.instagram_id,
        youtube: userProfileData?.youtube_id,
        twiiter: userProfileData?.twiiter_id,
        profileImage: userProfileData?.profile,
        notification: userProfileData?.notification === "1" || userProfileData?.notification === 1,
    });
    const fileInputRef = useRef(null);

    const [uploadedImage, setUploadedImage] = useState(userProfileData?.profile || null);

    const lang = useSelector(languageData);

    useEffect(() => { }, [lang]);
    const SettingsData = useSelector(settingsData);
    const PlaceHolderImg = SettingsData?.web_placeholder_logo;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData({
                    ...formData,
                    profileImage: file,
                });
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click(); // Trigger the file input click event
    };

    const handleLocationSelected = (locationData) => {
        setFormData({
            ...formData,
            selectedLocation: locationData,
        });
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setFormData({ ...formData, phoneNumber: value });
        }
    };
    const handleToggleChange = () => {
        setFormData((prevData) => ({
            ...prevData,
            notification: !prevData.notification, // Toggles false to true or true to false
        }));


        // Check if notification is true and FcmToken is not empty immediately after toggling
        if (!formData.notification && FcmToken !== "") {
            requestNotificationPermission();
        }
    };


    const handleUpdateProfile = (e) => {
        e.preventDefault();

        // Check if profile image is not available
        if (!formData.profileImage) {
            toast.error(translate("Please add a profile image"));
            return;
        }

        if (SettingsData.demo_mode) {
            Swal.fire({
                title: "Oops!",
                text: translate("notAllowdDemo"),
                icon: "warning",
                showCancelButton: false,
                customClass: {
                    confirmButton: 'Swal-confirm-buttons',
                    cancelButton: "Swal-cancel-buttons"
                },
                confirmButtonText: translate("ok"),
            });
            return false;
        }

        UpdateProfileApi({
            name: formData.fullName,
            email: formData.email,
            mobile: formData.phoneNumber,
            address: formData.address,
            profile: formData.profileImage,
            latitude: formData.selectedLocation?.lat,
            longitude: formData.selectedLocation?.lng,
            about_me: formData.aboutMe || "",
            facebook_id: formData.facebook || "",
            twiiter_id: formData.twiiter || "",
            instagram_id: formData.instagram || "",
            youtube_id: formData.youtube || "",
            fcm_id: FcmToken ? FcmToken : "",
            notification: formData.notification ? "1" : "0",
            city: formData.selectedLocation?.city,
            state: formData.selectedLocation?.state,
            country: formData.selectedLocation?.country,
            onSuccess: (response) => {
                toast.success(translate("profileupdate"));
                loadUpdateUserData(response.data);
                navigate.push("/");
                setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    address: "",
                    aboutMe: "",
                    facebook: "",
                    instagram: "",
                    youtube: "",
                    twiiter: "",
                });
            },
            onError: (error) => {
                toast.error(error);
            }
        });
    };

    return (
        <VerticleLayout>
            <div className="container">
                <div className="dashboard_titles">
                    <h3>{translate("myProfile")}</h3>
                </div>
                <div className="profile_card">
                    <form>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-6">
                                <div className="card" id="personal_info_card">
                                    <div className="card-header">
                                        <h4>{translate("personalInfo")}</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <div className="add_profile_div">
                                                    <div className="image_div">
                                                        <Image loading="lazy" src={uploadedImage || PlaceHolderImg} alt="no_img" width={200} height={200} onError={placeholderImage} />
                                                    </div>
                                                    <div className="add_profile">
                                                        <input type="file" accept="image/jpeg, image/png" id="add_img" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />
                                                        <button type="button" onClick={handleUploadButtonClick}>
                                                            {translate("uploadImg")}
                                                        </button>

                                                        <p>{translate("Note:")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("fullName")}</span>
                                                    <input type="text" className="add_user_fields" name="fullName" placeholder={translate("enterFullName")} value={formData.fullName} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span htmlFor="notification">{translate('notification')} </span>
                                                    <span className="switch mt-2">
                                                        <input id="switch-rounded"
                                                            type="checkbox"
                                                            checked={formData.notification} // Reflects the boolean state
                                                            onChange={handleToggleChange} // Toggles the state onClick
                                                        />
                                                        <label htmlFor="switch-rounded"></label>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("email")}</span>
                                                    <input
                                                        readOnly={userProfileData?.logintype === "0" ? true : false}
                                                        type="text"
                                                        className="add_user_fields"
                                                        name="email"
                                                        placeholder={translate("enterEmail")}
                                                        value={formData.email}
                                                        onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("phoneNumber")}</span>
                                                    <input readOnly={userProfileData?.logintype === "1" ? true : false}
                                                        type="text"
                                                        maxLength={"16"}
                                                        className="add_user_fields"
                                                        name="phoneNumber"
                                                        placeholder={translate("enterPhonenumber")}
                                                        value={formData.phoneNumber}
                                                        onChange={handlePhoneNumberChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("location")}</span>

                                                    <LocationSearchBox onLocationSelected={handleLocationSelected}
                                                        initialLatitude={userProfileData?.latitude}
                                                        initialLongitude={userProfileData?.longitude}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("address")}</span>
                                                    <textarea rows={4} className="add_user_fields" name="address" placeholder={translate("enterAddress")} value={formData.address} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-6">
                                <div className="card" id="about_me_card">
                                    <div className="card-header">
                                        <h4>{translate("aboutMe")}</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="add_user_fields_div">
                                            <span>{translate("aboutMe")}</span>
                                            <textarea rows={21} className="add_user_fields" name="aboutMe" placeholder={translate("tellus")} value={formData.aboutMe} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="card" id="social_media_card">
                                    <div className="card-header">
                                        <h4>{translate("socialMedia")}</h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("facebook")}</span>
                                                    <input type="text" className="add_user_fields" name="facebook" placeholder={translate("Enter Facebook URL")} value={formData.facebook} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("insta")}</span>
                                                    <input type="text" className="add_user_fields" name="instagram" placeholder={translate("Enter Instagram URL")} value={formData.instagram} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("youtube")}</span>
                                                    <input type="text" className="add_user_fields" name="youtube" placeholder={translate("Enter Youtube URL")} value={formData.youtube} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div className="add_user_fields_div">
                                                    <span>{translate("twitter")}</span>
                                                    <input type="text" className="add_user_fields" name="twiiter" placeholder={translate("Enter LinkedIn URL")} value={formData.twiiter} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="submit_div">
                                        <button type="submit" onClick={handleUpdateProfile}>
                                            {translate("updateProfile")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </VerticleLayout>
    );
};

export default withAuth(UserProfile);
