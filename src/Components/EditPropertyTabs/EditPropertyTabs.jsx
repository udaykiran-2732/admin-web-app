"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { generateSlug, placeholderImage, translate } from "@/utils/helper";
import {
  GetAllCategorieApi,
  GetFacilitiesApi,
  UpdatePostProperty,
  getAddedPropertiesApi,
} from "@/store/actions/campaign";
import GoogleMapBox from "../Location/GoogleMapBox";
import Dropzone, { useDropzone } from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { userSignUpData } from "@/store/reducer/authSlice";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Image from "next/image";
import { Autocomplete } from "@react-google-maps/api";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function EditPropertyTabs() {
  const GoogleMapApi = process.env.NEXT_PUBLIC_GOOGLE_API;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);

  const propertyId = router.query.slug;
  const SettingsData = useSelector(settingsData);
  const userData = useSelector(userSignUpData);
  const user_address = userData?.data?.data?.address;
  const CurrencySymbol = SettingsData && SettingsData?.currency_symbol;
  const DistanceSymbol = SettingsData && SettingsData?.distance_option;

  const [value, setValue] = useState(0);
  const [getFacilities, setGetFacilities] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploaded3DImages, setUploaded3DImages] = useState([]); // State to store uploaded images
  const [galleryImages, setGalleryImages] = useState([]); // State to store uploaded images
  const [uploadedOgImages, setUploadedOgImages] = useState([]); // State to store uploaded images
  const [categoryParameters, setCategoryParameters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [removeGalleryImgsId, setRemoveGalleryImgsId] = useState([]);

  const [selectedLocationAddress, setSelectedLocationAddress] = useState({
    lat: "",
    lng: "",
    city: "",
    state: "",
    country: "",
    formatted_address: "",
  });

  const limit = 12;
  const [CategoryData, setCategoryData] = useState([]);
  const [total, setTotal] = useState(0);
  const [offsetdata, setOffsetdata] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load

  const [tab1, setTab1] = useState({
    id: "",
    propertyType: "",
    category: "",
    title: "",
    price: "",
    propertyDesc: "",
    rentduration: "",
    isPrivate: false,
    slug: "",
  });

  const [tab2, setTab2] = useState({});

  const [tab3, setTab3] = useState({});

  const [tab5, setTab5] = useState({
    titleImage: [],
    _3DImages: [],
    galleryImages: [],
    docs: [],
    videoLink: "",
  });
  const [tab6, setTab6] = useState({
    MetaTitle: "",
    MetaKeyword: "",
    MetaDesc: "",
    ogImages: [],
  });

  useEffect(() => { }, [selectedLocationAddress]);

  useEffect(() => {
    GetFacilitiesApi(
      (response) => {
        // g(response)
        const facilitiyData = response && response.data;
        setGetFacilities(facilitiyData);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getAddedPropertiesApi({
      slug_id: propertyId,
      onSuccess: (response) => {
        const propertyData = response?.data[0];
        setSelectedLocationAddress((prevAddress) => ({
          ...prevAddress,
          lat: propertyData?.latitude,
          lng: propertyData?.longitude,
          city: propertyData?.city,
          state: propertyData?.state,
          country: propertyData?.country,
          formatted_address: propertyData?.address,
        }));
        setSelectedCategory(propertyData?.category);
        setIsLoading(false);
        if (propertyData) {
          setTab1({
            propertyType:
              propertyData.property_type === "sell" ? "0" : "1" || "",
            category: propertyData.category.id || "",
            title: propertyData.title || "",
            price: propertyData.price || "",
            propertyDesc: propertyData.description || "",
            rentduration:
              propertyData.rentduration === "Daily"
                ? "Daily"
                : propertyData.rentduration === "Monthly"
                  ? "Monthly"
                  : propertyData.rentduration === "Yearly"
                    ? "Yearly"
                    : propertyData.rentduration === "Quarterly"
                      ? "Quarterly"
                      : "",
            isPrivate: propertyData?.is_premium,
            slug: propertyData.slug_id ? propertyData?.slug_id : "",
            id: propertyData?.id ? propertyData?.id : "",
          });
        }
        if (propertyData) {
          setTab6({
            MetaTitle: propertyData.meta_title || "",
            MetaDesc: propertyData.meta_description || "",
            MetaKeyword: propertyData.meta_keywords || "",
          });
        }
        if (propertyData?.parameters) {
          const defaultTab2Values = propertyData.parameters.reduce((acc, param) => {
            try {
              // Parse the JSON string to get the original value
              acc[param.id] = JSON.parse(param.value);
            } catch (error) {
              // If parsing fails, use the value as-is
              console.error(`Error parsing value for parameter ${param.id}:`, error);
              acc[param.id] = param.value;
            }
            return acc;
          }, {});
        
          setTab2(defaultTab2Values);
        }
        if (propertyData.assign_facilities) {
          // Initialize tab3 with default values based on propertyData.assign_facilities
          const defaultTab3Values = {};

          propertyData.assign_facilities.forEach((facility) => {
            // Use facility.facility_id as the key to set the value
            defaultTab3Values[facility.facility_id] =
              facility?.distance?.toString();
          });

          // Set tab3 with the default values
          setTab3(defaultTab3Values);
        }

        // Check if propertyData.title_image exists and set it as the default title image
        if (propertyData.title_image) {
          // Assuming propertyData.title_image contains the image URL
          const titleImageURL = propertyData.title_image;

          // Fetch the image data and convert it to a Blob
          fetch(titleImageURL)
            .then((response) => response.blob())
            .then((blob) => {
              // Check if the fetched blob is of image type (e.g., image/jpeg, image/png, etc.)
              if (blob.type.startsWith("image/")) {
                // Create a File object from the Blob
                const file = new File([blob], "title_image.jpg", {
                  type: "image/jpeg",
                });

                // Set the default title image
                setUploadedImages([file]);
                setTab5((prevState) => ({
                  ...prevState,
                  titleImage: [file],
                }));
              } else {
                console.error("Fetched file is not an image.");
                // Handle the case where the fetched file is not an image
              }
            })
            .catch((error) => {
              console.error("Error fetching image data:", error);
            });
        }
        // Check if propertyData.three_d_image exists and set it as the default 3D image

        if (propertyData.three_d_image) {
          // Assuming propertyData.three_d_image contains the 3D image URL
          const threeDImageURL = propertyData.three_d_image;
          // Fetch the 3D image data and convert it to a Blob
          fetch(threeDImageURL)
            .then((response) => response.blob())
            .then((blob) => {
              // Check if the fetched blob is of the correct 3D image MIME type
              if (
                blob.type === "image/jpeg" ||
                blob.type === "image/png" ||
                blob.type === "image/svg+xml" ||
                blob.type === "image/jpg"
              ) {
                // Create a File object from the Blob
                const file = new File([blob], "3D_image.jpg", {
                  type: blob.type,
                });

                // Set the default 3D image
                setUploaded3DImages([file]);
                setTab5((prevState) => ({
                  ...prevState,
                  _3DImages: [file],
                }));
              } else {
                console.error("Fetched file is not a 3D image.");
                // Handle the case where the fetched file is not a 3D image
              }
            })
            .catch((error) => {
              console.error("Error fetching 3D image data:", error);
            });
        }

        // Check if propertyData.gallery exists and set it as the default gallery images
        if (propertyData.gallery && propertyData.gallery.length > 0) {
          const defaultGalleryImages = propertyData.gallery.map(
            (galleryItem) => {
              // Assuming galleryItem.image_url contains the image URL
              const imageUrl = galleryItem.image_url;
              // Create an object with a URL property for each image
              return { imageUrl, name: galleryItem.image, id: galleryItem.id };
            }
          );

          // Set the default gallery images
          setGalleryImages(defaultGalleryImages);
          setTab5((prevState) => ({
            ...prevState,
            galleryImages: defaultGalleryImages,
          }));
        }

        // Check if propertyData.title_image exists and set it as the default title image
        if (propertyData?.meta_image) {
          // Assuming propertyData.title_image contains the image URL
          const OgImageURL = propertyData?.meta_image;
          setTab6((prevState) => ({
            ...prevState,
            ogImages: OgImageURL,
          }));

          // Fetch the image data and convert it to a Blob
          fetch(OgImageURL)
            .then((response) => response.blob())
            .then((blob) => {
              // Check if the fetched blob is of image type (e.g., image/jpeg, image/png, etc.)
              if (blob.type.startsWith("image/")) {
                // Create a File object from the Blob
                const file = new File([blob], "meta_image.jpg", {
                  type: "image/jpeg",
                });

                // Set the default title image
                setUploadedOgImages([file]);
              } else {
                console.error("Fetched file is not an image.");
                // Handle the case where the fetched file is not an image
              }
            })
            .catch((error) => {
              console.error("Error fetching image data:", error);
            });
        }
        if (propertyData?.documents && propertyData.documents.length > 0) {
          // Set the converted files in tab5.docs
          setUploadedDocuments(propertyData?.documents);
        }
        if (propertyData.video_link) {
          setTab5((prevState) => ({
            ...prevState,
            videoLink: propertyData.video_link,
          }));
        }
      },
      onerror: (error) => {
        setIsLoading(false);
        console.log(error);
      },
    });
  }, [propertyId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === "title") {
      // Automatically generate slug when the title changes
      const slug = generateSlug(value);

      setTab1({
        ...tab1,
        title: value,
        slug: slug, // Update slug here
      });
      setTab6({
        ...tab6,
        title: value,
        slug: slug,
      });
    } else if (name === "slug") {
      // Convert spaces to hyphens and ensure valid slug format
      const formattedSlug = generateSlug(value);
      setTab1({
        ...tab1,
        slug: formattedSlug,
      });
      setTab6({
        ...tab6,
        slug: formattedSlug,
      });
    } else {
      // Update other fields as usual
      setTab1({
        ...tab1,
        [name]: value,
      });
      setTab6({
        ...tab6,
        [name]: value,
      });
    }
  };
  const handleCategoryChange = (e, data) => {
    setSelectedCategory(data);
    const selectedCategoryId = data?.id;

    const selectedCategoryData = CategoryData.find(
      (category) => category.id === selectedCategoryId
    );

    if (selectedCategoryData) {
      // Extract and set the parameters for the selected category
      setCategoryParameters(selectedCategoryData?.parameter_types);
    } else {
      // Reset parameters if the category is not found
      setCategoryParameters([]);
    }

    // Update the tab1 state with the selected category ID
    setTab1({
      ...tab1,
      category: selectedCategoryId, // Update tab1 with the ID
    });
    setValue(1);
  };
  useEffect(() => {
    if (tab1.category !== "") {
      const selectedCategoryId = parseInt(tab1.category);

      const selectedCategoryData = CategoryData.find(
        (category) => category.id === selectedCategoryId
      );

      if (selectedCategoryData) {
        setCategoryParameters(selectedCategoryData?.parameter_types);
      }
    }
  }, [tab1.category, CategoryData]);

  const handlePropertyTypes = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue !== tab1.propertyType) {
      // Only update formData.propertyType if a different option is selected
      setTab1({ ...tab1, propertyType: selectedValue });
    }
  };
  const handleRentDurationChange = (e) => {
    const value = e.target.value;
    // Do something with the selected value, for example, update the state
    setTab1((prevTab1) => ({ ...prevTab1, rentduration: value }));
  };
  const handleToggleChange = () => {
    setTab1({ ...tab1, isPrivate: !tab1.isPrivate });
  };
  useEffect(() => { }, [tab1?.isPrivate]);
  const handleTab2InputChange = (fieldId, value) => {
    setTab2((prevData) => ({
      ...prevData,
      [fieldId]: value,
    }));
  };
  const handleCheckboxChange = (fieldId, option, isChecked) => {
    setTab2((prevTab2Data) => {
      const updatedTab2 = { ...prevTab2Data };

      // Ensure prevSelectedOptions is always an array
      const prevSelectedOptions = Array.isArray(updatedTab2[fieldId])
        ? updatedTab2[fieldId]
        : [];

      // If checkbox is checked, add the option to the selected options
      if (isChecked) {
        updatedTab2[fieldId] = [...prevSelectedOptions, option];
      } else {
        // If checkbox is unchecked, remove the option from the selected options
        updatedTab2[fieldId] = prevSelectedOptions.filter(
          (selectedOption) => selectedOption !== option
        );
      }

      return updatedTab2;
    });
  };
  const handleRadioChange = (fieldId, selectedOption) => {
    setTab2((prevTab2Data) => ({
      ...prevTab2Data,
      [fieldId]: selectedOption,
    }));
  };

  const handleTab3InputChange = (fieldId, value) => {
    // Ensure that the input value is a positive number
    const parsedValue = parseFloat(value);
    const newValue = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;

    setTab3((prevData) => ({
      ...prevData,
      [fieldId]: newValue,
    }));
  };

  const handleLocationSelect = (address) => {
    // Update the form field with the selected address
    setSelectedLocationAddress(address);
  };

  const handleTab4InputChange = (event) => {
    const { name, value } = event.target;
    // Update the corresponding field in tab4Data using the input's "name" attribute
    setSelectedLocationAddress((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => { }, [tab1, tab2, tab3, selectedLocationAddress, tab5, tab6]);

  const updateFileInput = (fieldId) => (e) => {
    const fileInput = e.target;
    const fileLabel = document.getElementById(`file-label_${fieldId}`);
    const selectedFileName = document.getElementById(
      `selected-file-name_${fieldId}`
    );

    if (fileInput && fileLabel && selectedFileName) {
      if (fileInput.files.length > 0) {
        // Update the label text with the selected file name
        fileLabel.textContent = fileInput.files[0].name;
        selectedFileName.textContent = `Selected File: ${fileInput.files[0].name}`;

        // Store the selected file in tab2 state (assuming tab2 is an object)
        setTab2((prevTab2Data) => ({
          ...prevTab2Data,
          [fieldId]: fileInput.files[0],
        }));
      } else {
        // If no file is selected, revert to the default label text
        fileLabel.textContent = "Choose a file";
        selectedFileName.textContent = "";

        // Remove the file from tab2 state (if it exists)
        setTab2((prevTab2Data) => {
          const updatedTab2Data = { ...prevTab2Data };
          delete updatedTab2Data[fieldId];
          return updatedTab2Data;
        });
      }
    } else {
      console.error(
        `One or more elements with IDs not found: file-label_${fieldId}, selected-file-name_${fieldId}`
      );
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Append the uploaded files to the uploadedImages state
    setUploadedImages((prevImages) => [...prevImages, ...acceptedFiles]);
    setTab5((prevState) => ({
      ...prevState,
      titleImage: acceptedFiles,
    }));
  }, []);

  const removeImage = (index) => {
    // Remove an image from the uploadedImages state by index
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    }, // Accept only image files
  });

  const files = useMemo(
    () =>
      uploadedImages.map((file, index) => (
        <div key={index} className="dropbox_img_div">
          <Image
            loading="lazy"
            className="dropbox_img"
            src={file instanceof File ? URL.createObjectURL(file) : file.url}
            alt={file.name}
            width={200}
            height={200}
          />
          <div className="dropbox_d">
            <button
              className="dropbox_remove_img"
              onClick={() => removeImage(index)}
            >
              <CloseIcon fontSize="25px" />
            </button>
            <div className="dropbox_img_deatils">
              <span>{file.name}</span>
              <span>{Math.round(file.size / 1024)} KB</span>
            </div>
          </div>
        </div>
      )),
    [uploadedImages]
  );
  const onDrop3D = useCallback((acceptedFiles) => {
    // Log the acceptedFiles to check if they are being received correctly

    // Append the uploaded 3D files to the uploaded3DImages state
    setUploaded3DImages((prevImages) => [...prevImages, ...acceptedFiles]);
    setTab5((prevState) => ({
      ...prevState,
      _3DImages: acceptedFiles,
    }));
  }, []);

  const remove3DImage = (index) => {
    // Remove a 3D image from the uploaded3DImages state by index
    setUploaded3DImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);

      // Update tab5._3DImages state to reflect the removal
      setTab5((prevState) => ({
        ...prevState,
        _3DImages: updatedImages,
      }));

      return updatedImages;
    });
  };

  const {
    getRootProps: getRootProps3D,
    getInputProps: getInputProps3D,
    isDragActive: isDragActive3D,
  } = useDropzone({
    onDrop: onDrop3D,
    accept: "model/*", // Accept only 3D model files (update the accept type as needed)
  });
  const files3D = useMemo(
    () =>
      uploaded3DImages.map((file, index) => (
        <div key={index} className="dropbox_img_div">
          <Image
            loading="lazy"
            className="dropbox_img"
            src={file instanceof File ? URL.createObjectURL(file) : file.url}
            alt={file.name}
            width={200}
            height={200}
          />
          <div className="dropbox_d">
            <button
              className="dropbox_remove_img"
              onClick={() => remove3DImage(index)}
            >
              <CloseIcon fontSize="25px" />
            </button>
            <div className="dropbox_img_deatils">
              <span>{file.name}</span>
              <span>{Math.round(file.size / 1024)} KB</span>
            </div>
          </div>
        </div>
      )),
    [uploaded3DImages]
  );

  const onDropGallery = useCallback((acceptedFiles) => {
    setGalleryImages((prevImages) => {
      // Find the first available slot (undefined or null) or append to the end
      const newImages = [...prevImages];
      acceptedFiles.forEach((file) => {
        const emptyIndex = newImages.findIndex(
          (img) => img === undefined || img === null
        );
        if (emptyIndex !== -1) {
          newImages[emptyIndex] = file;
        } else {
          newImages.push(file);
        }
      });
      return newImages;
    });
    setTab5((prevState) => {
      const newGalleryImages = [...prevState.galleryImages];
      acceptedFiles.forEach((file) => {
        const emptyIndex = newGalleryImages.findIndex(
          (img) => img === undefined || img === null
        );
        if (emptyIndex !== -1) {
          newGalleryImages[emptyIndex] = file;
        } else {
          newGalleryImages.push(file);
        }
      });
      return {
        ...prevState,
        galleryImages: newGalleryImages,
      };
    });
  }, []);

  const removeGalleryImage = (index, id) => {
    setGalleryImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = undefined; // Mark the slot as empty instead of removing it
      return newImages;
    });
    setTab5((prevState) => {
      const newGalleryImages = [...prevState.galleryImages];
      newGalleryImages[index] = undefined; // Mark the slot as empty instead of removing it
      return {
        ...prevState,
        galleryImages: newGalleryImages,
      };
    });
    setRemoveGalleryImgsId((prevIds) => new Set([...prevIds, id]));
  };

  const {
    getRootProps: getRootPropsGallery,
    getInputProps: getInputPropsGallery,
    isDragActive: isDragActiveGallery,
  } = useDropzone({
    onDrop: onDropGallery,
    accept: "image/*", // Accept only image files for the gallery
    multiple: true, // Allow multiple file selection
  });
  const galleryFiles = useMemo(
    () =>
      galleryImages.map((imageData, index) => {
        if (!imageData) return null; // Skip rendering for undefined slots

        // Create a URL for the File object
        const imageUrl =
          imageData instanceof File
            ? URL.createObjectURL(imageData)
            : imageData.imageUrl;

        return (
          <div key={index} className="dropbox_gallary_img_div">
            <Image
              loading="lazy"
              className="dropbox_img"
              src={imageUrl}
              alt={imageData.name || `Gallery image ${index + 1}`}
              width={200}
              height={200}
            />
            <div className="dropbox_d">
              <button
                className="dropbox_remove_img"
                onClick={() => removeGalleryImage(index, imageData.id)}
                type="button"
              >
                <CloseIcon fontSize="25px" />
              </button>
              <div className="dropbox_img_deatils">
                <span>{imageData.name || `Image ${index + 1}`}</span>
              </div>
            </div>
          </div>
        );
      }),
    [galleryImages]
  );

  useEffect(() => { }, [removeGalleryImgsId]);

  // Seo OG img
  const onDropOgImage = useCallback((acceptedFiles) => {
    // Log the acceptedFiles to check if they are being received correctly

    // Append the uploaded ogImage files to the uploadedOgImages state
    setUploadedOgImages((prevImages) => [...prevImages, ...acceptedFiles]);
    setTab6((prevState) => ({
      ...prevState,
      ogImages: acceptedFiles,
    }));
  }, []);

  const removeOgImage = (index) => {
    // Remove an ogImage from the uploadedOgImages state by index
    setUploadedOgImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );

    // Also remove the ogImage from the tab6.ogImages state by index
    setTab6((prevState) => ({
      ...prevState,
      ogImages: "",
    }));
  };

  const {
    getRootProps: getRootPropsOgImage,
    getInputProps: getInputPropsOgImage,
    isDragActive: isDragActiveOgImage,
  } = useDropzone({
    onDrop: onDropOgImage,
    accept: "image/*", // Accept only image files (update the accept type as needed)
  });

  const ogImageFiles = useMemo(
    () =>
      uploadedOgImages.map((file, index) => (
        <div key={index} className="dropbox_img_div">
          <img
            className="dropbox_img"
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
          <div className="dropbox_d">
            <button
              className="dropbox_remove_img"
              onClick={() => removeOgImage(index)}
            >
              <CloseIcon fontSize="25px" />
            </button>
            <div className="dropbox_img_deatils">
              <span>{file.name}</span>
              <span>{Math.round(file.size / 1024)} KB</span>
            </div>
          </div>
        </div>
      )),
    [uploadedOgImages]
  );

  const [uploadedDocuments, setUploadedDocuments] = useState([]); // State to store uploaded documents
  const [removeDocId, setRemoveDocId] = useState([]);
  const onDropDocuments = useCallback((acceptedFiles) => {
    // Append the uploaded documents to the uploadedDocuments state
    setUploadedDocuments((prevDocuments) => [
      ...prevDocuments,
      ...acceptedFiles,
    ]);
    setTab5((prevState) => ({
      ...prevState,
      docs: acceptedFiles,
    }));
  }, []);
  // Function to remove a document by index
  const removeDocument = (index, docId) => {
    setUploadedDocuments((prevDocuments) =>
      prevDocuments.filter((_, i) => i !== index)
    );
    setRemoveDocId((prevIds) => new Set([...prevIds, docId]));
  };

  const {
    getRootProps: getRootPropsDocuments,
    getInputProps: getInputPropsDocuments,
    isDragActive: isDragActiveDocuments,
  } = useDropzone({
    onDrop: onDropDocuments,
    multiple: true, // Ensure that the dropzone allows multiple files
  });

  // Render uploaded documents
  const documentFiles = useMemo(
    () =>
      uploadedDocuments.map((file, index) => (
        <div key={index} className="dropbox_docs">
          <div className="doc_title">
            <span>{file.file_name ? file?.file_name : file?.name}</span>
            {/* <span>{Math.round(file.size / 1024)} KB</span>   */}
          </div>
          <button
            className="dropbox_remove_img"
            onClick={() => removeDocument(index, file?.id)}
          >
            <CloseIcon fontSize="25px" />
          </button>
        </div>
      )),
    [uploadedDocuments]
  );
  useEffect(() => { }, [removeDocId]);
  const handleVideoInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    // Update the tab5 state with the entered video link
    setTab5((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const areFieldsFilled = (tab) => {
    // Check if any of the required fields are empty or undefined
    if (!tab.propertyType || !tab.title || !tab.price || !tab.propertyDesc) {
      // Some required fields are not filled
      return false;
    }

    // All required fields are filled
    return true;
  };
  const areFieldsFilled1 = (seodata) => {
    // Check if any of the required fields are empty or undefined
    if (!seodata.MetaTitle || !seodata.MetaKeyword || !seodata.MetaDesc) {
      // Some required fields are not filled
      return false;
    }

    // All required fields are filled
    return true;
  };

  const areLocationFieldsFilled = (location) => {
    // Check if any of the required fields are empty or undefined
    if (
      !location.city ||
      !location.state ||
      !location.country ||
      !location.formatted_address
    ) {
      // Some required fields are not filled
      return false;
    }

    // All required fields are filled
    return true;
  };

  const handleNextTab = (e) => {
    e.preventDefault();
    if (!areFieldsFilled(tab1)) {
      // Display a toast message to fill in all required fields
      toast.error(translate("fillallfields"));
    } else {
      // Proceed to the next tab
      setValue(value + 1);
    }
  };
  const handleNextTab2 = (e) => {
    e.preventDefault();
    // Proceed to the next tab
    setValue(value + 1);
  };

  const handleNextTab3 = (e) => {
    e.preventDefault();

    // Find all required parameters
    const requiredParams = categoryParameters.filter(
      (param) => param.is_required === 1
    );

    // Collect names of missing required parameters
    const missingParams = requiredParams
      .filter((param) => !tab2[param.id] || tab2[param.id] === "")
      .map((param) => param.name);

    if (missingParams.length > 0) {
      // Show toast with names of missing required fields
      toast.error(`${translate("fillallfields")}: ${missingParams.join(", ")}`);
    } else {
      // Proceed to the next tab
      setValue(value + 1);
    }
  };

  const handleNextTab4 = () => {
    // Check if the location fields in tab 4 are empty
    if (!areLocationFieldsFilled(selectedLocationAddress)) {
      // Display a toast message to fill in all property address details in tab 4
      toast.error(translate("propAddDetials"));
    } else {
      // Proceed to the next tab
      setValue(value + 1);
    }
  };

  const handleUpdatePostproperty = (e) => {
    e.preventDefault();

    if (SettingsData.demo_mode) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }
    if (!tab1.category) {
      // Display a toast message if Title Image is not selected
      toast.error(translate("pleaseSelectCatgory"));
      setValue(0);
    }
    // g(Object.fromEntries(new FormData(e.target)));
    else if (!areFieldsFilled(tab1)) {
      // Display a toast message to fill in all required fields for Tab 1
      toast.error(translate("propertyDetailsFeilds"));

      // Switch to Tab 1
      setValue(0);
    } else if (!areLocationFieldsFilled(selectedLocationAddress)) {
      // Display a toast message to fill in all required location fields
      toast.error(translate("specsLoc"));
      // Switch to Tab 4
      setValue(4);
    } else if (uploadedImages.length === 0) {
      // Display a toast message if Title Image is not selected
      toast.error(translate("pleaseSelectTitleImg"));
    } else {
      setShowLoader(true);
      const parameters = [];
      const facilities = [];

      // Assuming tab2 contains parameter data
      for (const [key, value] of Object.entries(tab2)) {

        // Convert the value to a JSON string, regardless of whether it's an array or not
        const formattedValue = JSON.stringify(value);

        parameters.push({
          parameter_id: key,
          value: formattedValue, // Always pass the value as a JSON string
        });

      }

      // Assuming tab2 contains parameter data
      for (const [key, value] of Object.entries(tab3)) {
        facilities.push({
          facility_id: key,
          distance: value,
          // You may need to adjust these fields based on your data structure
        });
      }

      const threeDImage = tab5._3DImages.length > 0 ? tab5._3DImages[0] : "";
      const galleryImages =
        tab5.galleryImages.length > 0 ? tab5.galleryImages : "";
      const titleImage = tab5.titleImage.length > 0 ? tab5.titleImage[0] : "";
      const ogImages =
        tab6.ogImages && tab6.ogImages.length > 0 ? tab6.ogImages[0] : "";
      const removeGalleryArray = Array.from(removeGalleryImgsId);
      // Concatenate parameters and facilities into the allParameters array
      const removeDocArray = Array.from(removeDocId);

      // Rest of your code remains the same
      UpdatePostProperty({
        id: tab1?.id,
        action_type: "0",
        slug_id: tab1?.slug,
        title: tab1.title,
        description: tab1.propertyDesc,
        price: tab1.price,
        category_id: tab1.category,
        property_type: tab1.propertyType,
        rentduration: tab1.rentduration ? tab1.rentduration : "",
        is_premium: tab1?.isPrivate,
        city: selectedLocationAddress.city,
        state: selectedLocationAddress.state,
        country: selectedLocationAddress.country,
        latitude: selectedLocationAddress.lat,
        longitude: selectedLocationAddress.lng,
        address: selectedLocationAddress.formatted_address,
        client_address: user_address ? user_address : "",
        parameters: parameters, // Pass the combined parameters as "allParameters"
        facilities: facilities,
        title_image: titleImage,
        three_d_image: threeDImage,
        gallery_images: galleryImages,
        video_link: tab5.videoLink,
        meta_title: tab6.MetaTitle,
        meta_description: tab6.MetaDesc,
        meta_keywords: tab6.MetaKeyword,
        meta_image: ogImages,
        documents: tab5?.docs,
        remove_gallery_images: removeGalleryArray,
        remove_documents: removeDocArray,
        remove_three_d_image: !threeDImage ? 1 : "",
        onSuccess: (response) => {
          toast.success(response.message);
          router.push("/user/dashboard");
          setShowLoader(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error);
          setShowLoader(false);
        },
      });
    }
  };
  const [autocomplete, setAutocomplete] = useState(null);
  const getFieldValue = (addressComponents, fieldType) => {
    const field = addressComponents.find((component) =>
      component.types.includes(fieldType)
    );
    return field ? field.long_name : "";
  };

  const handlePlaceChanged = () => {
    const place = autocomplete.getPlace();
    if (place && place.address_components) {
      const city = getFieldValue(place.address_components, "locality");
      const state = getFieldValue(
        place.address_components,
        "administrative_area_level_1"
      );
      const country = getFieldValue(place.address_components, "country");
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      setSelectedLocationAddress((prevData) => ({
        ...prevData,
        city,
        state,
        country,
        lat: latitude,
        lng: longitude,
      }));
    }
  };

  useEffect(() => { }, [selectedLocationAddress]);

  const fetchAllCategory = () => {
    try {
      GetAllCategorieApi({
        offset: offsetdata.toString(),
        limit: limit.toString(),
        onSuccess: (response) => {
          setTotal(response.total);
          const cateData = response.data;
          setCategoryData((prevListings) => [...prevListings, ...cateData]);

          setHasMoreData(cateData.length === limit);
        },
        onError: (error) => {
          console.log(error);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllCategory();
  }, [offsetdata]);
  const handleLoadMore = () => {
    const newOffset = offsetdata + limit;
    setOffsetdata(newOffset);
  };

  const handleDeselectCaetgory = () => {
    setSelectedCategory(null);
    setTab1((prevState) => ({
      ...prevState,
      category: "",
    }));
    setValue(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          id="addProp_tabs"
        >
          <Tab label={translate("categories")} {...a11yProps(0)} />
          <Tab label={translate("propDeatils")} {...a11yProps(1)} />
          <Tab label={translate("SEOS")} {...a11yProps(2)} />
          <Tab label={translate("facilities")} {...a11yProps(3)} />
          <Tab label={translate("OTF")} {...a11yProps(4)} />
          <Tab label={translate("location")} {...a11yProps(5)} />
          <Tab label={translate("I&V")} {...a11yProps(6)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div className="all_cate">
          {CategoryData &&
            CategoryData.map((ele, index) => (
              // <div className="col-sm-12 col-md-6 col-lg-2" key={index}>

              <div
                className={`category_card ${tab1.category === ele?.id ? "selected_category_card" : ""
                  }`}
                onClick={(e) => handleCategoryChange(e, ele)}
              >
                <div className="category_details">
                  <div className="cate_img_div">
                    <Image
                      loading="lazy"
                      src={ele?.image ? ele?.image : placeholderImage}
                      alt="no_img"
                      className="category_img"
                      width={0}
                      height={0}
                      onError={placeholderImage}
                    />
                  </div>
                  <div>
                    <span className="category_name">{ele.category}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {hasMoreData ? (
          <div className="col-12 loadMoreDiv mt-3" id="loadMoreDiv">
            <button className="loadMore" onClick={handleLoadMore}>
              {translate("loadmore")}
            </button>
          </div>
        ) : null}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div className="row" id="add_prop_form_row">
          <div className="col-sm-12 col-md-6">
            <div id="add_prop_form">
              {selectedCategory && (
                <div className="add_prop_fields">
                  <span>{translate("selectedCate")}</span>
                  <div
                    className="selected_cate"
                    onClick={handleDeselectCaetgory}
                  >
                    <div className="selected_cate_img">
                      <Image
                        src={selectedCategory?.image}
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className="selcted_cate_name">
                      <span>{selectedCategory?.category}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="add_prop_fields">
                <span className="is_require">{translate("propTypes")}</span>
                <div className="add_prop_types">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="flexRadioDefault1"
                      value="0"
                      onChange={handlePropertyTypes}
                      checked={tab1.propertyType === "0"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault1"
                    >
                      {translate("sell")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="flexRadioDefault1"
                      value="1"
                      onChange={handlePropertyTypes}
                      checked={tab1.propertyType === "1"}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault2"
                    >
                      {translate("rent")}
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <div className="add_prop_fields">
                    <span className="is_require">{translate("title")}</span>
                    <input
                      type="text"
                      id="prop_title_input"
                      placeholder={translate("enterPropertyTitle")}
                      name="title"
                      onChange={handleInputChange}
                      value={tab1.title}
                    />
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="add_prop_fields">
                    <span>{translate("slug")}</span>
                    <input
                      type="text"
                      id="prop_title_input"
                      placeholder={translate("enterPropertySlug")}
                      name="slug"
                      onChange={handleInputChange}
                      value={tab1.slug}
                    />
                  </div>
                </div>
              </div>
              {tab1.propertyType !== "1" ? (
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="add_prop_fields">
                      <span className="is_require">{translate("price")}</span>
                      <input
                        type="number"
                        id="prop_title_input"
                        placeholder={`${translate(
                          "enterPropPrice"
                        )} (${CurrencySymbol})`}
                        name="price"
                        onChange={handleInputChange}
                        value={tab1.price}
                        onInput={(e) => {
                          if (e.target.value < 0) {
                            e.target.value = 0;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="add_prop_fields">
                      <span>{translate("propStatus")}</span>
                      <span class="switch mt-2">
                        <input
                          id="switch-rounded"
                          type="checkbox"
                          checked={tab1.isPrivate}
                          onChange={handleToggleChange}
                        />
                        <label for="switch-rounded"></label>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-sm-12 col-md-6 col-lg-4">
                    <div className="add_prop_fields">
                      <span className="is_require">{translate("price")}</span>
                      <input
                        type="number"
                        id="prop_title_input"
                        placeholder={`${translate(
                          "enterPropPrice"
                        )} (${CurrencySymbol})`}
                        name="price"
                        onChange={handleInputChange}
                        value={tab1.price}
                        onInput={(e) => {
                          if (e.target.value < 0) {
                            e.target.value = 0;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-4">
                    <div className="add_prop_fields">
                      <span className="is_require">
                        {translate("RentDuration")}
                      </span>
                      <select
                        className="form-select RentDuration"
                        aria-label="Default select"
                        name="rentduration"
                        value={tab1.rentduration}
                        onChange={handleRentDurationChange}
                      >
                        <option value="">
                          {translate("SelectRentDuration")}
                        </option>
                        <option value="Daily">{translate("daily")}</option>
                        <option value="Monthly">{translate("monthly")}</option>
                        <option value="Yearly">{translate("yearly")}</option>
                        <option value="Quarterly">
                          {translate("quarterly")}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-4">
                    <div className="add_prop_fields">
                      <span>{translate("propStatus")}</span>
                      <span class="switch mt-2">
                        <input
                          id="switch-rounded"
                          type="checkbox"
                          checked={tab1.isPrivate}
                          onChange={handleToggleChange}
                        />
                        <label for="switch-rounded"></label>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-sm-12 col-md-6">
            <div className="add_prop_fields">
              <span className="is_require">{translate("propDesc")}</span>
              <textarea
                rows={13}
                id="about_prop"
                placeholder={translate("enterPropertyAbout")}
                name="propertyDesc"
                onChange={handleInputChange}
                value={tab1.propertyDesc}
              />
            </div>
          </div>
        </div>

        <div className="nextButton">
          <button type="button" onClick={handleNextTab}>
            {translate("next")}
          </button>
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
        <div className="row" id="add_prop_form_row">
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div id="add_prop_form">
              <div className="add_prop_fields">
                <span>{translate("metatitle")}</span>
                <input
                  type="text"
                  id="prop_title_input"
                  placeholder={translate("enterPropertyMetaTitle")}
                  name="MetaTitle"
                  onChange={handleInputChange}
                  value={tab6.MetaTitle}
                />
              </div>
              <p style={{ color: "#FF0000", fontSize: "smaller" }}>
                {" "}
                {translate("Warning: Meta Title")}
              </p>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div id="add_prop_form">
              <div className="add_prop_fields">
                <span>{translate("ogimage")}</span>
                <div className="dropbox">
                  <div
                    {...getRootPropsOgImage()}
                    className={`dropzone ${isDragActiveOgImage ? "active" : ""
                      }`}
                  >
                    <input {...getInputPropsOgImage()} />
                    {uploadedOgImages.length === 0 ? (
                      isDragActiveOgImage ? (
                        <span>{translate("dropFiles")}</span>
                      ) : (
                        <span>
                          {translate("dragFiles")}{" "}
                          <span style={{ textDecoration: "underline" }}>
                            {" "}
                            {translate("browse")}
                          </span>
                        </span>
                      )
                    ) : null}
                  </div>
                  <div>{ogImageFiles}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div id="add_prop_form">
              <div className="add_prop_fields">
                <span>{translate("metakeyword")}</span>
                <textarea
                  rows={5}
                  id="about_prop"
                  placeholder={translate("enterPropertyMetaKeywords")}
                  name="MetaKeyword"
                  onChange={handleInputChange}
                  value={tab6.MetaKeyword}
                />
              </div>
              <p style={{ color: "#FF0000", fontSize: "smaller" }}>
                {translate("Warning: Meta Keywords")}
              </p>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span>{translate("enterPropertyMetaDesc")}</span>
              <textarea
                rows={5}
                id="about_prop"
                placeholder={translate("enterProjectMetaDesc")}
                name="MetaDesc"
                onChange={handleInputChange}
                value={tab6.MetaDesc}
              />
            </div>
            <p style={{ color: "#FF0000", fontSize: "smaller" }}>
              {translate("Warning: Meta Description")}
            </p>
          </div>
        </div>

        <div className="nextButton">
          <button type="button" onClick={handleNextTab2}>
            {translate("next")}
          </button>
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={3}>
        <div className="row" id="add_prop_form_row">
          {categoryParameters && categoryParameters.length > 0 ? (
            categoryParameters.map((ele, index) => (
              <div className="col-sm-12 col-md-6 col-lg-3" key={index}>
                <div className="add_prop_fields">
                  <span className={ele?.is_required === 1 ? "is_require" : ""}>
                    {ele?.name}
                  </span>

                  {ele?.type_of_parameter === "number" ? (
                    <>
                      <input
                        value={tab2[ele?.id] || ""}
                        type="number"
                        className="prop_number_input"
                        id={`prop_title_input_${ele?.id}`}
                        onChange={(e) =>
                          handleTab2InputChange(ele?.id, e.target.value)
                        }
                        onInput={(e) => {
                          if (e.target.value < 0) {
                            e.target.value = 0;
                          }
                        }}
                      />
                    </>
                  ) : ele?.type_of_parameter === "checkbox" ? (
                    <>
                      <div className="row paramters_row">
                        {ele?.type_values.map((option, optionIndex) => (
                          <div className="col-sm-12" key={optionIndex}>
                            <div className="custom-checkbox">
                              <input
                                type="checkbox"
                                id={`checkbox_${ele?.id}_${optionIndex}`}
                                className="custom-checkbox-input"
                                checked={tab2[ele?.id]?.includes(option)}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    ele?.id,
                                    option,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`checkbox_${ele?.id}_${optionIndex}`}
                                className="custom-checkbox-label"
                              >
                                {option}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : ele?.type_of_parameter === "textbox" ? (
                    <input
                      type="text"
                      className="prop_textbox_input"
                      id={`textbox_${ele?.id}`}
                      value={tab2[ele?.id] || ""}
                      onChange={(e) =>
                        handleTab2InputChange(ele?.id, e.target.value)
                      }
                    />
                  ) : ele?.type_of_parameter === "textarea" ? (
                    <textarea
                      className="prop_textarea_input"
                      rows={4}
                      id={`textarea_${ele?.id}`}
                      value={tab2[ele?.id] || ""}
                      onChange={(e) =>
                        handleTab2InputChange(ele?.id, e.target.value)
                      }
                    />
                  ) : ele?.type_of_parameter === "radiobutton" ? (
                    <>
                      <div className="row paramters_row">
                        {ele?.type_values.map((option, optionIndex) => (
                          <div className="col-sm-12" key={optionIndex}>
                            <div className="custom-radio">
                              <input
                                type="radio"
                                id={`radio_${ele?.id}_${optionIndex}`}
                                name={`radio_${ele?.id}`}
                                className="custom-checkbox-input"
                                checked={tab2[ele?.id] === option}
                                onChange={(e) =>
                                  handleRadioChange(ele?.id, option)
                                }
                              />
                              <label
                                htmlFor={`radio_${ele?.id}_${optionIndex}`}
                                className="custom-checkbox-label"
                              >
                                {option}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : ele?.type_of_parameter === "dropdown" ? (
                    <div className="custom-dropdown">
                      <select
                        id={`dropdown_${ele?.id}`}
                        name={`dropdown_${ele?.id}`}
                        value={tab2[ele?.id] || ""}
                        onChange={(e) =>
                          handleTab2InputChange(ele?.id, e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {Array.isArray(ele?.type_values) ? (
                          ele.type_values.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {translate("invalidOption")}
                          </option>
                        )}
                      </select>
                    </div>
                  ) : ele?.type_of_parameter === "file" ? (
                    <>
                      <input
                        type="file"
                        id={`file-input_${ele?.id}`}
                        className="custom-file-input"
                        onChange={updateFileInput(ele?.id)}
                      />
                      <label
                        htmlFor={`file-input_${ele?.id}`}
                        className="custom-file01-label"
                        id={`file-label_${ele?.id}`}
                      >
                        Choose a file
                        {/* {typeof tab2[ele?.id] === "string"
                                                    ? tab2[ele?.id].split('/').pop()
                                                    : tab2[ele?.id]?.name || "Choose a file"} */}
                      </label>
                      {tab2[ele?.id] && (
                        <p id={`selected-file-name_${ele?.id}`}>
                          Selected File:{" "}
                          {typeof tab2[ele?.id] === "string"
                            ? tab2[ele?.id].split("/").pop()
                            : tab2[ele?.id]?.name}
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="col-sm-12">
              <span style={{ display: "flex", justifyContent: "center" }}>
                Please select a category to view additional fields.
              </span>
            </div>
          )}
        </div>
        <div className="nextButton">
          <button type="button" onClick={handleNextTab3}>
            {translate("next")}
          </button>
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={4}>
        <div className="row" id="add_prop_form_row">
          {getFacilities.length > 0
            ? getFacilities.map((ele, index) => (
              <div className="col-sm-12 col-md-6 col-lg-3" key={index}>
                <div className="add_prop_fields">
                  <span>{ele?.name}</span>
                  <input
                    value={tab3[ele?.id] || ""}
                    type="number"
                    placeholder={`00 ${DistanceSymbol}`}
                    className="prop_number_input"
                    id={`prop_title_input_${ele?.id}`}
                    onChange={(e) =>
                      handleTab3InputChange(ele?.id, e.target.value)
                    }
                  />
                </div>
              </div>
            ))
            : null}
        </div>
        <div className="nextButton">
          <button type="button" onClick={handleNextTab}>
            {translate("next")}
          </button>
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={5}>
        <div className="row" id="add_prop_form_row">
          <div className="col-sm-12 col-md-6">
            <div className="row" id="add_prop_form_row">
              <div className="col-sm-12 col-md-6">
                <div className="add_prop_fields">
                  <span className="is_require">{translate("city")}</span>
                  <Autocomplete
                    onLoad={(autocomplete) => setAutocomplete(autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                    types={["(cities)"]} // Filter results to only cities
                    componentRestrictions={{ country: "your_country_code" }} // Replace 'your_country_code' with the appropriate country code
                  >
                    <input
                      type="text"
                      style={{ width: "100%" }}
                      id="prop_title_input"
                      placeholder={translate("searchCity")}
                      name="city"
                      value={selectedLocationAddress.city}
                      onChange={(event) => handleTab4InputChange(event, "city")}
                    />
                  </Autocomplete>
                </div>
              </div>
              <div className="col-sm-12 col-md-6">
                <div className="add_prop_fields">
                  <span className="is_require">{translate("state")}</span>

                  <input
                    type="text"
                    id="prop_title_input"
                    placeholder={translate("enterState")}
                    name="state"
                    value={selectedLocationAddress.state}
                    onChange={(event) => handleTab4InputChange(event, "state")}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="add_prop_fields">
                  <span className="is_require">{translate("country")}</span>

                  <input
                    type="text"
                    id="prop_title_input"
                    placeholder={translate("enterCountry")}
                    name="country"
                    value={selectedLocationAddress.country}
                    onChange={(event) =>
                      handleTab4InputChange(event, "country")
                    }
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="add_prop_fields">
                  <span className="is_require">{translate("address")}</span>
                  <textarea
                    rows={6}
                    style={{ height: "100%", paddingTop: "10px" }}
                    id="prop_title_input"
                    placeholder={translate("enterFullAddress")}
                    name="formatted_address"
                    value={selectedLocationAddress.formatted_address}
                    onChange={handleTab4InputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6">
            <div className="map">
              <GoogleMapBox
                apiKey={GoogleMapApi}
                onSelectLocation={handleLocationSelect}
                latitude={selectedLocationAddress?.lat}
                longitude={selectedLocationAddress?.lng}
              />
            </div>
          </div>
        </div>
        <div className="nextButton">
          <button type="button" onClick={handleNextTab4}>
            {translate("next")}
          </button>
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={6}>
        <div className="row" id="add_prop_form_row">
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span className="is_require">{translate("titleImg")}</span>
              <div className="dropbox">
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? "active" : ""}`}
                >
                  <input {...getInputProps()} />
                  {uploadedImages.length === 0 ? (
                    isDragActive ? (
                      <span>{translate("dropFiles")}</span>
                    ) : (
                      <span>
                        {translate("dragFiles")}{" "}
                        <span style={{ textDecoration: "underline" }}>
                          {" "}
                          {translate("browse")}
                        </span>
                      </span>
                    )
                  ) : null}
                </div>
                <div>{files}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span>{translate("docs")}</span>
              <div className="dropbox">
                <div
                  {...getRootPropsDocuments()}
                  className={`dropzone ${isDragActiveDocuments ? "active" : ""
                    }`}
                >
                  <input {...getInputPropsDocuments({ multiple: true })} />{" "}
                  {/* Update here */}
                  {uploadedDocuments.length === 0 ? (
                    isDragActiveDocuments ? (
                      <span>{translate("dropFiles")}</span>
                    ) : (
                      <span>
                        {translate("dragFiles")}{" "}
                        <span style={{ textDecoration: "underline" }}>
                          {" "}
                          {translate("browse")}
                        </span>
                      </span>
                    )
                  ) : null}
                </div>
                <div className="docs_files">{documentFiles}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span>{translate("3dImg")}</span>
              <div className="dropbox">
                <div
                  {...getRootProps3D()}
                  className={`dropzone ${isDragActive3D ? "active" : ""}`}
                >
                  <input {...getInputProps3D()} />
                  {uploaded3DImages.length === 0 ? (
                    isDragActive3D ? (
                      <span>{translate("drop3dFiles")}</span>
                    ) : (
                      <span>
                        {translate("drag3dFiles")}{" "}
                        <span style={{ textDecoration: "underline" }}>
                          {" "}
                          {translate("browse")}
                        </span>
                      </span>
                    )
                  ) : null}
                </div>
                <div>{files3D}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span>{translate("GallryImg")}</span>
              <div className="dropbox">
                <div
                  {...getRootPropsGallery()}
                  className={`dropzone ${isDragActiveGallery ? "active" : ""}`}
                >
                  <input {...getInputPropsGallery()} />

                  {isDragActiveGallery ? (
                    <span>{translate("dropgallaryFiles")}</span>
                  ) : (
                    <span>
                      {translate("draggallaryFiles")}{" "}
                      <span style={{ textDecoration: "underline" }}>
                        {" "}
                        {translate("browse")}
                      </span>
                    </span>
                  )}
                </div>
                <div>{galleryFiles}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="add_prop_fields">
              <span>{translate("videoLink")}</span>
              <input
                type="input"
                id="prop_title_input"
                name="videoLink"
                placeholder={translate("enterVideoLink")}
                value={tab5.videoLink}
                onChange={handleVideoInputChange}
              />
            </div>
          </div>
        </div>

        <div className="updateButton">
          {showLoader ? (
            <button disabled>
              <div className="loader-container-otp">
                <div
                  className="loader-otp"
                  style={{ borderTopColor: "#282f39" }}
                ></div>
              </div>
            </button>
          ) : (
            <button type="submit" onClick={(e) => handleUpdatePostproperty(e)}>
              {translate("submitProp")}
            </button>
          )}
        </div>
      </CustomTabPanel>
    </Box>
  );
}
