import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { FaStar, FaStarHalfAlt, FaImage, FaTimes } from "react-icons/fa";
import { useCreateReview } from "../../shared/hooks/useReview";
import { toast } from "react-toastify";
import api from "../../shared/services/api";
import logger from "../../shared/utils/logger";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

async function uploadReviewImages(files) {
  if (!files || files.length === 0) return [];

  const uploadSingle = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/uploads/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url =
        response?.data?.data?.url ||
        response?.data?.data?.secureUrl ||
        response?.data?.url ||
        response?.data?.secureUrl;

      if (!url || typeof url !== "string") {
        throw new Error("Upload succeeded but no image URL was returned");
      }

      return url;
    } catch (error) {
      logger.error("[CreateReviewForm] Image upload failed:", {
        message: error?.message,
        name: error?.name,
      });
      throw error;
    }
  };

  return Promise.all(files.map(uploadSingle));
}

export default function CreateReviewForm({ productId, orderId, orderItemId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
   const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const createReviewMutation = useCreateReview();
  const imageUrlsRef = useRef([]);

  useEffect(() => {
    imageUrlsRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Handle half-star rating click
  const handleStarClick = (starValue, isHalf) => {
    const newRating = isHalf ? starValue - 0.5 : starValue;
    setRating(newRating);
  };

  // Handle star hover for half-star preview
  const handleStarHover = (starValue, isHalf, isEntering) => {
    if (isEntering) {
      const hoverValue = isHalf ? starValue - 0.5 : starValue;
      setHoveredRating(hoverValue);
    } else {
      setHoveredRating(0);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const existingCount = images.length;
    if (existingCount >= MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    const existingKeys = new Set(
      imageFiles.map(
        (file) => `${file.name}_${file.size}_${file.lastModified}`
      )
    );

    const nextFiles = [];

    for (const file of files) {
      const key = `${file.name}_${file.size}_${file.lastModified}`;

      if (existingKeys.has(key)) {
        toast.error(`"${file.name}" is already selected`);
        continue;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(
          `${file.name} is too large. Maximum size is 5MB`
        );
        continue;
      }

      nextFiles.push(file);
      existingKeys.add(key);
    }

    const availableSlots = MAX_IMAGES - existingCount;
    const filesToAdd = nextFiles.slice(0, availableSlots);

    if (!filesToAdd.length) {
      return;
    }

    const newUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newUrls]);
    setImageFiles((prev) => [...prev, ...filesToAdd]);

    if (filesToAdd.length < nextFiles.length) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
    }

    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading || createReviewMutation.isPending) {
      return;
    }

    if (!rating || !title || !review) {
      toast.error("Please fill all required fields");
      return;
    }

    if (rating < 0.5 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    setUploadError("");

    let uploadedImageUrls = [];

    if (imageFiles.length > 0) {
      try {
        setIsUploading(true);
        uploadedImageUrls = await uploadReviewImages(imageFiles);
      } catch (error) {
        setUploadError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to upload images. Please check your connection and try again."
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      const reviewData = {
        product: productId,
        order: orderId,
        ...(orderItemId && { orderItem: orderItemId }),
        rating,
        title: title.trim(),
        review: review.trim(),
        images: uploadedImageUrls,
      };

      await createReviewMutation.mutateAsync(reviewData);
      
      toast.success("Review submitted successfully! It will be reviewed before being published.");
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormTitle>Write a Review</FormTitle>

      <RatingSection>
        <Label>Rating *</Label>
        <StarContainer>
          {[1, 2, 3, 4, 5].map((star) => {
            const displayRating = hoveredRating || rating;
            const isFullFilled = displayRating >= star;
            const isHalfFilled = displayRating >= star - 0.5 && displayRating < star;
            const isEmpty = displayRating < star - 0.5;

            return (
              <StarWrapper key={star}>
                <StarButton
                  type="button"
                  onMouseEnter={() => handleStarHover(star, false, true)}
                  onMouseLeave={() => handleStarHover(star, false, false)}
                  onClick={() => handleStarClick(star, false)}
                  $isActive={isFullFilled}
                >
                  <FaStar size={32} />
                </StarButton>
                <HalfStarButton
                  type="button"
                  onMouseEnter={() => handleStarHover(star, true, true)}
                  onMouseLeave={() => handleStarHover(star, true, false)}
                  onClick={() => handleStarClick(star, true)}
                  $isActive={isHalfFilled}
                >
                  <FaStarHalfAlt size={32} />
                </HalfStarButton>
              </StarWrapper>
            );
          })}
        </StarContainer>
        {rating > 0 && (
          <RatingText>
            You rated this {rating.toFixed(1)} out of 5
          </RatingText>
        )}
      </RatingSection>

      <InputGroup>
        <Label>Review Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
          maxLength={100}
        />
        <CharCount>{title.length}/100</CharCount>
      </InputGroup>

      <InputGroup>
        <Label>Your Review *</Label>
        <TextArea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={6}
          required
          maxLength={1000}
        />
        <CharCount>{review.length}/1000</CharCount>
      </InputGroup>

      <InputGroup>
        <Label>Add Photos (Optional, max 5)</Label>
        <ImageUpload>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="image-upload"
            disabled={images.length >= MAX_IMAGES}
          />
          <UploadButton htmlFor="image-upload" as="label" $disabled={images.length >= MAX_IMAGES}>
            <FaImage /> Add Photos ({images.length}/{MAX_IMAGES})
          </UploadButton>
        </ImageUpload>
        {images.length > 0 && (
          <ImagePreview>
            {images.map((img, idx) => (
              <ImageItem key={idx}>
                <ImagePreviewImg src={img} alt={`Review ${idx + 1}`} />
                <RemoveButton onClick={() => removeImage(idx)}>
                  <FaTimes />
                </RemoveButton>
              </ImageItem>
            ))}
          </ImagePreview>
        )}
        {isUploading && (
          <UploadStatusText>Uploading images… Please wait.</UploadStatusText>
        )}
        {uploadError && <UploadErrorText>{uploadError}</UploadErrorText>}
      </InputGroup>

      <FormActions>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        )}
        <SubmitButton
          type="submit"
          disabled={
            createReviewMutation.isPending ||
            isUploading ||
            !rating ||
            !title ||
            !review
          }
        >
          {createReviewMutation.isPending || isUploading
            ? "Submitting..."
            : uploadError
            ? "Retry upload & submit"
            : "Submit Review"}
        </SubmitButton>
      </FormActions>
    </FormContainer>
  );
}

// Styled Components
const FormContainer = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
`;

const RatingSection = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const StarWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
`;

const StarButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: ${props => props.$isActive ? 2 : 1};
  transition: transform 0.2s;
  color: ${props => props.$isActive ? "#fbbf24" : "#e2e8f0"};

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const HalfStarButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: ${props => props.$isActive ? 3 : 1};
  transition: transform 0.2s;
  color: ${props => props.$isActive ? "#fbbf24" : "transparent"};
  overflow: hidden;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 32px;
    height: 32px;
    position: absolute;
    left: 0;
    top: 0;
  }
`;

const RatingText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const CharCount = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: right;
  margin-top: 0.25rem;
`;

const ImageUpload = styled.div`
  margin-bottom: 1rem;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not([disabled]) {
    background: #e2e8f0;
    border-color: #94a3b8;
  }

  ${({ $disabled }) =>
    $disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImageItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ImagePreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

