"use client"
import React from "react";
import { FiMail, FiPhone } from "react-icons/fi";
import { AiOutlineInstagram } from "react-icons/ai";
import { CiFacebook } from "react-icons/ci";
import { ImPinterest2 } from "react-icons/im";
import playstore from "../../assets/playStore.png";
import appstore from "../../assets/appStore.png";
import Link from "next/link";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { placeholderImage, translate } from "@/utils/helper";

import Image from "next/image";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";

const Footer = () => {
    const systemData = useSelector(settingsData);
    const webdata = systemData && systemData;
    const currentYear = new Date().getFullYear();
    return (
        <section id="footer">
            <div className="container">
                <div className="row py-5" id="footer_deatils">
                    {(webdata?.web_footer_logo || webdata?.company_email || webdata?.company_tel1 || webdata?.company_tel2) && (
                        <div className="col-12 col-md-6 col-lg-3">
                            <div id="footer_logo_section">
                                {webdata?.web_footer_logo &&
                                    <Link href="/">
                                        <span className="logo-text">Horizon Collabration</span>
                                    </Link>
                                }
                                {webdata && webdata.company_email &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiMail size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("email")}</span>
                                            <a href="mailto:adminn@horizoncollabration.in">
                                                <span className="footer_span_value">adminn@horizoncollabration.in</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                {webdata && webdata.company_tel1 &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiPhone size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("contactOne")}</span>
                                            <a href={`tel:${webdata && webdata.company_tel1}`}>
                                                <span className="footer_span_value">{webdata && webdata.company_tel1}</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                {webdata && webdata.company_tel2 &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiPhone size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("contactTwo")}</span>
                                            <a href={`tel:${webdata && webdata.company_tel2}`}>
                                                <span className="footer_span_value">{webdata && webdata.company_tel2}</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                {/* {webdata?.facebook_id || webdata?.instagram_id || webdata?.youtube_id || webdata?.twitter_id ? (
                                    <div>
                                        <h4> {translate("followUs")}</h4>
                                        <div id="follow_us">
                                            {webdata?.facebook_id ? (
                                                <a href={webdata?.facebook_id} target="_blank">
                                                    <CiFacebook size={28} />
                                                </a>
                                            ) : null}
                                            {webdata?.instagram_id ? (
                                                <a href={webdata?.instagram_id} target="_blank">
                                                    <AiOutlineInstagram size={28} />
                                                </a>
                                            ) : null}
                                            {webdata?.youtube_id ? (
                                                <a href={webdata?.youtube_id}>
                                                    <FaYoutube size={25} />
                                                </a>
                                            ) : null}
                                            {webdata?.twitter_id ? (
                                                <a href={webdata?.twitter_id} target="_blank">
                                                    <FaXTwitter size={25} />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (null)} */}
                            </div>
                        </div>
                    )}

                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_prop_section">
                            <div id="footer_headlines">
                                <span>{translate("properties")}</span>
                            </div>
                            <div className="prop_links">
                                <Link href="/properties/all-properties">{translate("allProperties")}</Link>
                            </div>
                            <div className="prop_links">
                                <Link href="/featured-properties">{translate("featuredProp")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/most-viewed-properties">{translate("mostViewedProp")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/properties-nearby-city">{translate("nearbyCities")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/most-favorite-properties">{translate("mostFavProp")}</Link>
                            </div>

                            {/* <div className='prop_links'>
                                <Link href="/listby-agents">
                                    List by Agents Properties
                                </Link>
                            </div> */}
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_page_section">
                            <div id="footer_headlines">
                                <span>{translate("pages")}</span>
                            </div>
                            <div className="page_links">
                                <Link href="/subscription-plan">{translate("subscriptionPlan")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/articles">{translate("articles")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/faqs">{translate("faqs")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/terms-and-condition">{translate("terms&condition")}</Link>
                            </div>

                            <div className="page_links">
                                <Link href="/privacy-policy">{translate("privacyPolicy")}</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_download_section">
                            <div id="footer_headlines">
                                <span>{translate("downloadApps")}</span>
                            </div>
                            <div className="download_app_desc">
                                <span>{translate("Getthelatest")} {webdata?.company_name} {translate("Selectyourdevice")}</span>
                            </div>

                            <div className="download_app_platforms">
                                {webdata?.playstore_id ? (
                                    <div id="playstore_logo">
                                        <a href="https://play.google.com" target="_blank">
                                            <Image loading="lazy" src={playstore?.src} alt="no_img" className="platforms_imgs" width={0} height={0} style={{ width: "100%", height: "100%" }} onError={placeholderImage} />
                                        </a>
                                    </div>
                                ) : null}
                                {webdata?.appstore_id ? (
                                    <div id="appstore_logo">
                                        <a href="https://apple.com" target="_blank">
                                            <Image loading="lazy" src={appstore?.src} alt="no_img" className="platforms_imgs" width={0} height={0} style={{ width: "100%", height: "100%" }} onError={placeholderImage} />
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rights_footer">
                <hr />
                <div className="footer container">

                    <div>
                        <h6>{translate("Copyright")} {currentYear} Horizon Collabration {translate("All Rights Reserved")}</h6>
                    </div>
                    <div>
                        {webdata?.facebook_id || webdata?.instagram_id || webdata?.youtube_id || webdata?.twitter_id ? (
                            <div>
                                {/* <h4> {translate("followUs")}</h4> */}
                                <div id="follow_us">
                                    <span>
                                    {translate("followUs")}
                                    </span>
                                    {webdata?.facebook_id ? (
                                        <a href={webdata?.facebook_id} target="_blank">
                                            <CiFacebook size={28} />
                                        </a>
                                    ) : null}
                                    {webdata?.instagram_id ? (
                                        <a href={webdata?.instagram_id} target="_blank">
                                            <AiOutlineInstagram size={28} />
                                        </a>
                                    ) : null}
                                    {webdata?.youtube_id ? (
                                        <a href={webdata?.youtube_id}>
                                            <FaYoutube size={25} />
                                        </a>
                                    ) : null}
                                    {webdata?.twitter_id ? (
                                        <a href={webdata?.twitter_id} target="_blank">
                                            <FaXTwitter size={25} />
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        ) : (null)}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Footer;
