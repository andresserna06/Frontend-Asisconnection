import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPrimaryRole, useAuth } from '@/modules/auth';
import { useCreatePost } from '@/modules/posts/application/useCreatePost';
import { usePostsService } from '@/modules/posts/usePostsService';
import {
  CATEGORY_COLORS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import type { CategoryKey } from '@/shared/theme';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';
import { POST_DRAFT_ISSUE_MESSAGES, POST_ERROR_MESSAGES, POST_STRINGS } from './strings';

const POST_CATEGORIES: { key: Exclude<CategoryKey, 'announcements'>; label: string }[] = [
  { key: 'questions', label: POST_STRINGS.categories.questions },
  { key: 'guides', label: POST_STRINGS.categories.guides },
  { key: 'achievements', label: POST_STRINGS.categories.achievements },
];

export function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const service = usePostsService();
  const { submit, clearFeedback, isSubmitting, draftIssue, error } = useCreatePost(service);
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const primaryRole = user === null ? null : getPrimaryRole(user.roles);
  const initials = user?.username.slice(0, 2).toUpperCase() ?? 'AS';

  const feedbackMessage = draftIssue
    ? POST_DRAFT_ISSUE_MESSAGES[draftIssue]
    : error
      ? POST_ERROR_MESSAGES[error.kind]
      : null;

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Se requiere acceso a la galería para adjuntar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedPhotoUri(result.assets[0].uri);
    }
  }

  async function handleTakePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Se requiere acceso a la cámara para tomar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedPhotoUri(result.assets[0].uri);
    }
  }

  async function handlePublish() {
    let mediaUrls: string[] | undefined;
    if (selectedPhotoUri) {
      try {
        setIsUploadingPhoto(true);
        const uploadedUrl = service.uploadMedia
          ? await service.uploadMedia(selectedPhotoUri)
          : selectedPhotoUri;
        mediaUrls = [uploadedUrl];
      } catch {
        setIsUploadingPhoto(false);
        Alert.alert('Error', 'No se pudo subir la imagen adjunta. Intenta de nuevo.');
        return;
      } finally {
        setIsUploadingPhoto(false);
      }
    }

    const result = await submit({ category: selectedCategory, content, mediaUrls });
    if (result === null) {
      return;
    }

    if (result.status === 'REJECTED') {
      Alert.alert(POST_STRINGS.rejectedTitle, result.message || POST_STRINGS.rejectedMessage);
      return;
    }

    Alert.alert(POST_STRINGS.submittedTitle, result.message || POST_STRINGS.submittedMessage);
    router.back();
  }

  function handleContentChange(value: string) {
    setContent(value);
    clearFeedback();
  }

  function handleCategorySelect(category: CategoryKey) {
    setSelectedCategory(category);
    clearFeedback();
  }

  return (
    <ResponsiveScreen>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={POST_STRINGS.cancel}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Icon name="x" size={SIZE.icon} color={COLORS.primary} />
          </Pressable>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
            {POST_STRINGS.title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={POST_STRINGS.publish}
            disabled={isSubmitting || isUploadingPhoto}
            onPress={handlePublish}
            style={({ pressed }) => [
              styles.publishButton,
              (pressed || isSubmitting || isUploadingPhoto) && styles.pressed,
            ]}
          >
            <Text style={styles.publishLabel}>
              {isUploadingPhoto
                ? 'Subiendo foto...'
                : isSubmitting
                  ? POST_STRINGS.publishing
                  : POST_STRINGS.publish}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.editor}
          contentContainerStyle={styles.editorContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{initials}</Text>
            </View>
            <View style={styles.authorDetails}>
              <Text numberOfLines={1} style={styles.authorName}>
                {user?.username ?? 'Tu perfil'}
              </Text>
              {primaryRole !== null && <Text style={styles.roleLabel}>{primaryRole.label}</Text>}
            </View>
          </View>

          <TextInput
            accessibilityLabel={POST_STRINGS.writePost}
            multiline
            value={content}
            onChangeText={handleContentChange}
            placeholder={POST_STRINGS.placeholder}
            placeholderTextColor={COLORS.textTertiary}
            style={styles.input}
            textAlignVertical="top"
          />

          {selectedPhotoUri !== null && (
            <View style={styles.imagePreviewContainer}>
              <Image source={selectedPhotoUri} style={styles.imagePreview} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Eliminar foto adjunta"
                hitSlop={8}
                onPress={() => setSelectedPhotoUri(null)}
                style={({ pressed }) => [styles.removeImageButton, pressed && styles.pressed]}
              >
                <Icon name="x" size={SIZE.iconSmall} color={COLORS.onPrimary} />
              </Pressable>
            </View>
          )}

          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>{POST_STRINGS.chooseTopic}</Text>
            <View style={styles.categoryRow}>
              {POST_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.key;
                const palette = CATEGORY_COLORS[category.key];

                return (
                  <Pressable
                    key={category.key}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => handleCategorySelect(category.key)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? palette.main : COLORS.surface,
                        borderColor: palette.main,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: isSelected ? COLORS.onPrimary : palette.onSoft },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {feedbackMessage !== null && (
            <Text accessibilityRole="alert" style={styles.feedbackError}>
              {feedbackMessage}
            </Text>
          )}
        </ScrollView>

        <View style={[styles.gallery, { paddingBottom: insets.bottom + SPACING.s12 }]}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>{POST_STRINGS.galleryTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={POST_STRINGS.openGallery}
              onPress={handlePickImage}
              style={({ pressed }) => [styles.galleryButton, pressed && styles.pressed]}
            >
              <Text style={styles.galleryAction}>{POST_STRINGS.galleryLabel}</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={POST_STRINGS.openCamera}
            onPress={handleTakePhoto}
            style={({ pressed }) => [styles.cameraButton, pressed && styles.pressed]}
          >
            <Icon name="camera" size={SIZE.icon} color={COLORS.primary} />
            <Text style={styles.cameraLabel}>{POST_STRINGS.cameraLabel}</Text>
          </Pressable>
          <Text style={styles.galleryEmpty}>
            {selectedPhotoUri !== null
              ? '1 foto seleccionada lista para publicar'
              : POST_STRINGS.galleryEmpty}
          </Text>
        </View>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s16,
    paddingVertical: SPACING.s10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.surfaceMuted,
  },
  title: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
  },
  publishButton: {
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s16,
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.primary,
  },
  publishLabel: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s15,
  },
  pressed: {
    opacity: 0.7,
  },
  editor: {
    flex: 1,
  },
  editorContent: {
    gap: SPACING.s14,
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s16,
    paddingBottom: SPACING.s12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
  },
  avatar: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  avatarLabel: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s15,
  },
  authorDetails: {
    flex: 1,
    gap: SPACING.s4,
  },
  authorName: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  roleLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.s9,
    paddingVertical: SPACING.s2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
    color: COLORS.onSurfaceMuted,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s11_5,
  },
  input: {
    minHeight: 140,
    padding: 0,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s17,
    lineHeight: 25,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: SPACING.s8,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    height: 180,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.s8,
    right: SPACING.s8,
    backgroundColor: COLORS.danger,
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySection: {
    gap: SPACING.s8,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
    letterSpacing: 0.8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
  },
  categoryChip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s16,
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
  },
  categoryLabel: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  feedbackError: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13_5,
  },
  gallery: {
    gap: SPACING.s10,
    paddingTop: SPACING.s12,
    paddingHorizontal: SPACING.s20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s14_5,
  },
  galleryButton: {
    minHeight: SIZE.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s8,
  },
  galleryAction: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
  },
  cameraButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.textTertiary,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  cameraLabel: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12,
  },
  galleryEmpty: {
    position: 'absolute',
    left: 112,
    top: 60,
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
  },
});
