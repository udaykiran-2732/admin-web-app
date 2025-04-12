"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BsInstagram, BsPinterest } from "react-icons/bs";
import { FiMail, FiPhoneCall } from "react-icons/fi";
import { MdLocationPin } from "react-icons/md";
import { PiFacebookLogoBold } from "react-icons/pi";
import { toast } from "react-hot-toast";
import { translate } from "@/utils/helper";
import { useSelector } from "react-redux";
import { languageData } from "@/store/reducer/languageSlice";
import { ContactUsApi } from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import Layout from "../Layout/Layout";
import { FaYoutube } from "react-icons/fa";

const ContactUS = () => {
  const lang = useSelector(languageData);

  useEffect(() => {}, [lang]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isloading, setIsLoading] = useState(false);

  const systemsettings = useSelector(settingsData);

  const formRef = useRef(null); // Create a ref for the form
  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      // If any field is empty, show "Please fill all fields" error
      toast.error(translate("allFields"));
      // alert("Please fill all fields")
      return false;
    }

    if (!isValidEmail(formData.email)) {
      // If email is invalid, show "Invalid email format" error
      toast.error(translate("emailIsNotValid"));

      return false;
    }

    return true;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleContactUsSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error(translate("allFields"));
    } else if (!isValidEmail(formData.email)) {
      // Check if the email is valid
      toast.error(translate("emailIsNotValid"));
    } else {
      setIsLoading(true);
      // All fields are filled and email is valid, proceed with the API call
      ContactUsApi(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.subject,
        formData.message,
        (response) => {
          toast.success(response.message);

          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            message: "",
          });
          setIsLoading(false);
        },
        (error) => {
          toast.error(error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <Layout>
      <Breadcrumb title={translate("contactUs")} />
      <section id="contact-us">
        <div className="container">
          <div className="row" id="main-rows-cols">
            <div
              className="col-12 col-md-6 col-lg-8"
              id="left-side-contact-form"
            >
              <div className="card contactus-card">
                <div className="card-header">
                  <h3>{translate("haveQue")}</h3>
                  <span>{translate("getInTouch")}</span>
                </div>
                <div className="card-body">
                  <form ref={formRef} onSubmit={handleContactUsSubmit}>
                    <div className="row">
                      <div className="col-sm-12 col-md-6">
                        {/* First Name */}
                        <div className="form-inputs">
                          <label htmlFor="firstName">
                            {translate("firstName")}
                          </label>
                          <input
                            type="text"
                            className="form-custom-input"
                            name="firstName"
                            placeholder={translate("enterFirstName")}
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        {/* Last Name */}
                        <div className="form-inputs">
                          <label htmlFor="lastName">
                            {translate("lastName")}
                          </label>
                          <input
                            type="text"
                            className="form-custom-input"
                            name="lastName"
                            placeholder={translate("enterLastName")}
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        {/* Email */}
                        <div className="form-inputs">
                          <label htmlFor="email">{translate("email")}</label>
                          <input
                            type="text"
                            className="form-custom-input"
                            name="email"
                            placeholder={translate("enterEmail")}
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        {/* Subject */}
                        <div className="form-inputs">
                          <label htmlFor="subject">
                            {translate("subject")}
                          </label>
                          <input
                            type="text"
                            className="form-custom-input"
                            name="subject"
                            placeholder={translate("enterSubject")}
                            value={formData.subject}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12">
                        {/* Message */}
                        <div className="form-inputs">
                          <label htmlFor="message">
                            {translate("message")}
                          </label>
                          <textarea
                            rows={8}
                            className="form-custom-input-textarea"
                            name="message"
                            placeholder={translate("enterMessage")}
                            value={formData.message}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="contact-submit">
                      {isloading ? (
                        <button
                          className="contact-submit-button"
                          type="button"
                          disabled
                        >
                          <div className="loader-container-otp">
                                <div className="loader-otp" style={{ borderTopColor: "#282f39" }}></div>
                            </div>
                        </button>
                      ) : (
                        <button className="contact-submit-button" type="submit">
                          {translate("submit")}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div
              className="col-12 col-md-6 col-lg-4"
              id="right-side-contact-info"
            >
              <div className="card contact-info">
                <div className="card-header">
                  <h3>{translate("contactInfo")}</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="contact-info-deatils">
                        <div className="contact-icons">
                          <MdLocationPin
                            size={30}
                            className="contact-solo-icons"
                          />
                        </div>
                        <div className="contact-deatils">
                          <p>{translate("officeAdd")}</p>
                          <span>{systemsettings?.company_address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="contact-info-deatils">
                        <div className="contact-icons">
                          <FiPhoneCall
                            size={18}
                            className="contact-solo-icons"
                          />
                        </div>
                        <div className="contact-deatils">
                          <p>{translate("tele")}</p>
                          <a
                            href={`tel:${systemsettings?.company_tel1}`}
                            style={{ textDecoration: "none" }}
                          >
                            <span>{systemsettings?.company_tel1}</span>
                          </a>
                          <a
                            href={`tel:${systemsettings?.company_tel2}`}
                            style={{ textDecoration: "none" }}
                          >
                            <span>{systemsettings?.company_tel2}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="contact-info-deatils">
                        <div className="contact-icons">
                          <FiMail size={18} className="contact-solo-icons" />
                        </div>
                        <div className="contact-deatils">
                          <p>{translate("emailUs")}</p>
                          <a
                            href={`mailto:${systemsettings?.company_email}`}
                            style={{ textDecoration: "none" }}
                          >
                            <span>{systemsettings?.company_email}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    {systemsettings?.facebook_id &&
                      systemsettings?.instagram_id &&
                      systemsettings?.twitter_id &&
                      systemsettings?.youtube_id && (
                        <div className="col-12" id="contactus-socialPlatforms">
                          <h3>{translate("followUs")}</h3>
                          <div className="row">
                            {systemsettings?.facebook_id ? (
                              <div
                                className="col-sm-12 col-md-6 col-lg-3"
                                id="social-platforms"
                              >
                                <a
                                  href={systemsettings?.facebook_id}
                                  target="_blank"
                                >
                                  <button className="social-platforms-icons">
                                    <PiFacebookLogoBold size={30} />
                                  </button>
                                </a>
                              </div>
                            ) : null}
                            {systemsettings?.instagram_id ? (
                              <div
                                className="col-sm-12 col-md-6 col-lg-3"
                                id="social-platforms"
                              >
                                <a
                                  href={systemsettings?.instagram_id}
                                  target="_blank"
                                >
                                  <button className="social-platforms-icons">
                                    <BsInstagram size={30} />
                                  </button>
                                </a>
                              </div>
                            ) : null}
                            {systemsettings?.youtube_id ? (
                              <div
                                className="col-sm-12 col-md-6 col-lg-3"
                                id="social-platforms"
                              >
                                <a
                                  href={systemsettings?.youtube_id}
                                  target="_blank"
                                >
                                  <button className="social-platforms-icons">
                                    <FaYoutube size={30} />
                                  </button>
                                </a>
                              </div>
                            ) : null}
                            {systemsettings?.twitter_id ? (
                              <div
                                className="col-sm-12 col-md-6 col-lg-3"
                                id="social-platforms"
                              >
                                <a
                                  href={systemsettings?.twitter_id}
                                  target="_blank"
                                >
                                  <button className="social-platforms-icons">
                                    <AiFillTwitterCircle size={30} />
                                  </button>
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card conatctus-location-map">
            <iframe
              src={systemsettings?.iframe_link}
              style={{
                width: "100%",
                height: "400px",
                style: "border:0",
                allowFullScreen: "true",
                loading: "lazy",
                referrerpolicy: "no-referrer-when-downgrade",
                borderRadius: "8px",
              }}
            ></iframe>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactUS;
