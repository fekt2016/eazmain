import { useRef } from "react";
import styled from "styled-components";

const PersonalInfoSection = ({
  userInfo,
  newProfileData,
  onChange,
  error,
  avatarPreview,
  onAvatarChange,
  onAvatarUpload,
  avatarFile,
  isUploading,
  onSavePersonalInfo,
  isSaving,
}) => {
  const fileInputRef = useRef(null);

  // Function to handle click on the avatar image
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  return (
    <NotificationSection>
      <SectionHeader>
        <SectionIcon>👤</SectionIcon>
        <SectionTitle>Personal Information</SectionTitle>
      </SectionHeader>
      <SectionContent>
        {error && (
          <ErrorMessage>Error updating profile: {error.message}</ErrorMessage>
        )}

        {/* Avatar Upload Section */}
        <FormGroup>
          <Label>Profile Picture</Label>
          <AvatarContainer>
            {/* Make the avatar image a clickable label for the file input */}
            <AvatarLabel htmlFor="avatar-upload" onClick={handleAvatarClick}>
              <AvatarPreview
                src={avatarPreview || userInfo?.photo}
                alt="Profile preview"
                hasImage={!!(avatarPreview || userInfo?.photo)}
              >
                {!(avatarPreview || userInfo?.photo) && (
                  <DefaultAvatar>👤</DefaultAvatar>
                )}
                <AvatarOverlay>
                  <CameraIcon>📷</CameraIcon>
                  <ChangeText>Change Photo</ChangeText>
                </AvatarOverlay>
              </AvatarPreview>
            </AvatarLabel>

            <AvatarControls>
              <HiddenFileInput
                type="file"
                ref={fileInputRef}
                id="avatar-upload"
                accept="image/*"
                name="avatar"
                onChange={onAvatarChange}
              />
              <UploadButton
                onClick={onAvatarUpload}
                disabled={!avatarFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Avatar"}
              </UploadButton>
              <FileInfo>
                {avatarFile
                  ? `Selected: ${avatarFile.name}`
                  : "No file selected"}
              </FileInfo>
            </AvatarControls>
          </AvatarContainer>
          <FileRequirements>
            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF.
          </FileRequirements>
        </FormGroup>

        {/* Personal Information Form */}
        <FormGroup>
          <FormRow>
            <InputGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={newProfileData.name || userInfo?.name || ""}
                onChange={onChange}
              />
            </InputGroup>
          </FormRow>

          <FormRow>
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={newProfileData.email || userInfo?.email || ""}
                onChange={onChange}
                disabled
              />
            </InputGroup>
          </FormRow>

          <FormRow>
            <InputGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                name="phone"
                value={newProfileData.phone || userInfo?.phone || ""}
                onChange={onChange}
              />
            </InputGroup>
          </FormRow>
        </FormGroup>

        {/* Save button for personal information only */}
        <SaveButton onClick={onSavePersonalInfo} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Personal Information"}
        </SaveButton>
      </SectionContent>
    </NotificationSection>
  );
};

export default PersonalInfoSection;

const NotificationSection = styled.div`
  background: var(--color-grey-50);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-grey-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

const SectionContent = styled.div`
  padding: 0.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem 1rem;
`;

const InputGroup = styled.div`
  flex: 1 1 100%;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  @media (min-width: 640px) {
    flex: 1 1 50%;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-grey-200);
  border-radius: 6px;
  background-color: var(--color-white-0);
  font-size: 0.875rem;
  color: var(--color-grey-900);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: var(--color-red-100);
  border: 1px solid var(--color-red-500);
  border-radius: 6px;
  color: var(--color-red-600);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarLabel = styled.label`
  cursor: pointer;
  display: block;
  position: relative;
`;

const AvatarPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  border: 3px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: var(--color-brand-500);

    div {
      opacity: 1;
    }
  }
`;

const DefaultAvatar = styled.div`
  font-size: 2.5rem;
  color: var(--color-grey-400);
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
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const CameraIcon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
`;

const ChangeText = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--color-green-500);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-green-700);
  }

  &:disabled {
    background-color: var(--color-grey-400);
    cursor: not-allowed;
  }
`;

const FileInfo = styled.p`
  margin: 0;
  padding: 0.5rem;
  background-color: var(--color-grey-50);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--color-grey-700);
`;

const FileRequirements = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-grey-500);
`;

const AvatarControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--color-brand-500);
  color: var(--color-white-0);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
  }

  &:disabled {
    background-color: var(--color-grey-400);
    cursor: not-allowed;
  }
`;
