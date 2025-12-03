import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  FormGroup,
  FormRow,
  Label,
  Input,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner } from "../../../components/loading";
import useAuth from "../../../shared/hooks/useAuth";
import { compressImage } from "../../../shared/utils/imageCompressor";
import { getAvatarUrl } from "../../../shared/utils/avatarUtils";
import styled from "styled-components";
import { FaCamera } from "react-icons/fa";

const AccountTab = ({ userInfo }) => {
  console.log('userInfo', userInfo);
  const { updateProfile, uploadAvatar } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: userInfo.name || "",
    email: userInfo.email || "",
    phone: userInfo.phone || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(userInfo.photo);
  const [avatarFile, setAvatarFile] = useState(null);
  const [dirty, setDirty] = useState(false);

  

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.warning("Please select an image first");
      return;
    }

    const compressedImage = await compressImage(avatarFile, {
      quality: 0.7,
      maxWidth: 1024,
    });

    const formData = new FormData();
    formData.append("photo", compressedImage);

    uploadAvatar.mutate(formData, {
      onSuccess: (data) => {
        setAvatarFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Update avatar preview with new photo URL immediately
        const updatedUser = data?.data?.data?.user || data?.data?.user || data?.user;
        if (updatedUser?.photo) {
          setAvatarPreview(getAvatarUrl(updatedUser.photo));
        }
        // Show success toast
        toast.success("Avatar uploaded successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        // The useAuth hook already updates the cache, but we can show success immediately
        // No need to invalidate here as it's handled in useAuth
      },
      onError: (error) => {
        console.error("Error uploading avatar:", error);
        toast.error(
          error?.response?.data?.message || "Error uploading avatar. Please try again.",
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      },
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData, {
      onSuccess: (data) => {
        setDirty(false);
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      },
      onError: (error) => {
        console.error("Error updating profile:", error);
        toast.error(
          error?.response?.data?.message || "Failed to update profile. Please try again.",
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      },
    });
  };

  return (
    <ContentCard>
      <CardTitle>Account Information</CardTitle>
      <CardDescription>
        Update your personal information and contact details.
      </CardDescription>

      {/* Avatar Upload Section */}
      <AvatarSection>
        <Label>Profile Picture</Label>
        <AvatarContainer>
          <AvatarPreviewWrapper onClick={triggerFileInput}>
            <AvatarPreview
              src={avatarPreview || (userInfo?.photo ? getAvatarUrl(userInfo.photo) : null)}
              hasImage={!!(avatarPreview || userInfo?.photo)}
            >
              {!(avatarPreview || userInfo?.photo) && (
                <DefaultAvatar>👤</DefaultAvatar>
              )}
              <AvatarOverlay>
                <FaCamera />
                <ChangeText>Change Photo</ChangeText>
              </AvatarOverlay>
            </AvatarPreview>
          </AvatarPreviewWrapper>
          <AvatarControls>
            <HiddenFileInput
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleAvatarUpload}
              disabled={!avatarFile || uploadAvatar.isPending}
            >
              {uploadAvatar.isPending ? (
                <>
                  <ButtonSpinner size="sm" /> Uploading...
                </>
              ) : (
                "Upload Avatar"
              )}
            </Button>
          </AvatarControls>
        </AvatarContainer>
        <FileRequirements>
          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF.
        </FileRequirements>
      </AvatarSection>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormRow>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </FormRow>
          <FormRow>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </FormRow>
        </FormGroup>

        <Button
          type="submit"
          variant="primary"
          disabled={!dirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <>
              <ButtonSpinner size="sm" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </ContentCard>
  );
};

export default AccountTab;

// Avatar Upload Styles
const AvatarSection = styled.div`
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-top: var(--space-md);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarPreviewWrapper = styled.div`
  cursor: pointer;
  position: relative;
`;

const AvatarPreview = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: ${(props) => (props.src ? `url(${props.src})` : "none")};
  background-size: cover;
  background-position: center;
  border: 3px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
  background-color: ${(props) => (props.hasImage ? "transparent" : "var(--color-bg-light)")};

  &:hover {
    border-color: var(--color-primary);
    
    div {
      opacity: 1;
    }
  }
`;

const DefaultAvatar = styled.div`
  font-size: 3rem;
  color: var(--color-text-light);
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  gap: var(--space-xs);

  svg {
    font-size: 24px;
  }
`;

const ChangeText = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

const AvatarControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileRequirements = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: var(--color-text-light);
  margin-top: var(--space-sm);
  margin-bottom: 0;
`;

