import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { selectPhotoFromLibrary } from 'src/components/unitags/AvatarSelection'
import { ChooseNftModal } from 'src/components/unitags/ChooseNftModal'
import { Flex, Text, useSporeColors } from 'ui/src'
import { Camera, PhotoStacked, Trash } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { Modal } from 'uniswap/src/components/modals/Modal'
import { ElementName, ModalName } from 'uniswap/src/features/telemetry/constants'

type ChoosePhotoOptionsProps = {
  address: Maybe<Address>
  hasNFTs: boolean
  setPhotoUri: (uri?: string) => void
  onClose: () => void
  showRemoveOption: boolean
}

export const ChoosePhotoOptionsModal = ({
  address,
  hasNFTs,
  setPhotoUri,
  onClose,
  showRemoveOption,
}: ChoosePhotoOptionsProps): JSX.Element => {
  const colors = useSporeColors()
  const [showNftsList, setShowNftsList] = useState(false)

  const onPressNftsList = async (): Promise<void> => {
    setShowNftsList(true)
  }

  const onCloseNftsList = (): void => {
    setShowNftsList(false)
    onClose()
  }

  const onRemovePhoto = async (): Promise<void> => {
    setPhotoUri(undefined)
    onClose()
  }

  const onPressCameraRoll = async (): Promise<void> => {
    const selectedPhoto = await selectPhotoFromLibrary()
    // Close needs to happen before setting the photo, otherwise the handler can get cut short
    onClose()
    if (selectedPhoto) {
      setPhotoUri(selectedPhoto)
    }
  }

  const options = [
    {
      key: `${ElementName.OpenCameraRoll}`,
      onPress: onPressCameraRoll,
      item: <ChoosePhotoOption type={PhotoAction.BrowseCameraRoll} />,
    },
  ]

  if (hasNFTs) {
    options.push({
      key: `${ElementName.OpenNftsList}`,
      onPress: onPressNftsList,
      item: <ChoosePhotoOption type={PhotoAction.BrowseNftsList} />,
    })
  }

  if (showRemoveOption) {
    options.push({
      key: `${ElementName.Remove}`,
      onPress: onRemovePhoto,
      item: <ChoosePhotoOption type={PhotoAction.RemovePhoto} />,
    })
  }

  return (
    <>
      <Modal
        isDismissible
        backgroundColor={colors.surface1.val}
        hideHandlebar={false}
        name={ModalName.ChooseProfilePhoto}
        onClose={onClose}
      >
        <Flex centered gap="$spacing24" pt="$spacing8" px="$spacing24">
          <Flex gap="$spacing12" width="100%">
            {options.map((option) => (
              <Flex key={option.key} onPress={option.onPress}>
                {option.item}
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Modal>
      {showNftsList && address && (
        <ChooseNftModal address={address} setPhotoUri={setPhotoUri} onClose={onCloseNftsList} />
      )}
    </>
  )
}

enum PhotoAction {
  BrowseCameraRoll = 'camera-roll',
  BrowseNftsList = 'nfts-list',
  RemovePhoto = 'remove-photo',
}

const ChoosePhotoOption = ({ type }: { type: PhotoAction }): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Flex
      row
      alignItems="center"
      backgroundColor="$surface3"
      borderRadius="$rounded20"
      gap="$spacing16"
      justifyContent="flex-start"
      p="$spacing24"
    >
      {type === PhotoAction.BrowseCameraRoll && <Camera color="$neutral1" size={iconSizes.icon24} />}
      {type === PhotoAction.BrowseNftsList && <PhotoStacked color="$neutral1" size={iconSizes.icon24} />}
      {type === PhotoAction.RemovePhoto && <Trash color="$statusCritical" size={iconSizes.icon24} />}
      <Flex shrink alignItems="flex-start">
        <Text
          color={type === PhotoAction.RemovePhoto ? '$statusCritical' : '$neutral1'}
          numberOfLines={1}
          variant="buttonLabel1"
        >
          {type === PhotoAction.BrowseCameraRoll && t('unitags.choosePhoto.option.cameraRoll')}
          {type === PhotoAction.BrowseNftsList && t('unitags.choosePhoto.option.nft')}
          {type === PhotoAction.RemovePhoto && t('unitags.choosePhoto.option.remove')}
        </Text>
      </Flex>
    </Flex>
  )
}
