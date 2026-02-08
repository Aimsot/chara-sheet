/* src/hooks/preciousdays/useCharacterActions.ts */
import { useCallback, useEffect, useRef } from 'react'; // useRef, useEffect を追加

import imageCompression from 'browser-image-compression';

import {
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
  ELEMENT_DATA,
  ElementKey,
  ABILITY_KEYS,
  ABILITY_DATA,
} from '@/constants/preciousdays';
import { saveCharacterAction, deleteCharacterAction } from '@/lib/preciousdays/actions';
import { Character, Item, Skill } from '@/types/preciousdays/character';
import { generateUUID } from '@/utils/uuid';

export const useCharacterActions = (
  char: Character,
  setChar: React.Dispatch<React.SetStateAction<Character>>,
  selectedFile?: File | null,
  setIsSubmitting?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // ▼ 1. 最新の char を常に参照できるようにする (Refテクニック)
  const charRef = useRef(char);
  useEffect(() => {
    charRef.current = char;
  }, [char]);

  // プロフィールの更新
  const updateBaseField = useCallback(
    (field: keyof Character, value: any) => {
      setChar((prev) => ({ ...prev, [field]: value }));
    },
    [setChar]
  );

  // 外見情報の更新
  const updateAppearance = useCallback(
    (field: string, value: string) => {
      setChar((prev: any) => ({
        ...prev,
        appearance: {
          ...(prev.appearance || {}),
          [field]: value,
        },
      }));
    },
    [setChar]
  );

  // --- 能力値計算ロジック ---
  const updateAbilities = useCallback(
    (updates: Partial<Character>) => {
      setChar((prev: Character) => {
        const nextChar = { ...prev, ...updates };

        if (!nextChar.species || !nextChar.style || !nextChar.element) {
          return nextChar;
        }

        const baseMap = SPECIES_DATA[nextChar.species as SpeciesKey].abilities;
        const styleBonusMap = STYLE_DATA[nextChar.style as StyleKey].bonuses;
        const elementBonusMap = ELEMENT_DATA[nextChar.element as ElementKey].bonuses;

        const newAbilities = { ...nextChar.abilities };
        ABILITY_KEYS.forEach((key) => {
          const base = baseMap[key];
          const bonus = nextChar.abilities[key].bonus || 0;
          const other = nextChar.abilities[key].otherModifier || 0;

          newAbilities[key] = {
            ...newAbilities[key],
            bonus,
            otherModifier: other,
            total:
              Math.floor((base + bonus) / 3) +
              ((styleBonusMap as any)[key] || 0) +
              ((elementBonusMap as any)[key] || 0) +
              other,
          };
        });

        return { ...nextChar, abilities: newAbilities };
      });
    },
    [setChar]
  );

  // 能力値ボーナス変更（バリデーション付き）
  const handleAbilitiesBonusChange = useCallback(
    (
      key: string,
      val: number,
      setErrorInfo: (info: { key: string; message: string } | null) => void
    ) => {
      // ▼ 2. Refから最新の値を取得（これで依存配列を空にできる！）
      const { abilities, species } = charRef.current;

      const abilityKey = key as keyof typeof abilities;
      const safeVal = Number.isNaN(val) ? 0 : Math.max(0, val);

      const speciesKey = (species || 'human') as SpeciesKey;
      const base = SPECIES_DATA[speciesKey]?.abilities[abilityKey] || 0;

      // バリデーション
      const otherBonusTotal = Object.entries(abilities).reduce((acc, [k, v]) => {
        return k === abilityKey ? acc : acc + (v.bonus || 0);
      }, 0);

      if (base + safeVal > 12) {
        setErrorInfo({
          key,
          message: `「${ABILITY_DATA[abilityKey].name}基本値 + ボーナス」は12が上限です`,
        });
      } else if (otherBonusTotal + safeVal > 5) {
        setErrorInfo({ key, message: 'ボーナスの合計は5点までです' });
      } else {
        setErrorInfo(null);
      }

      const updatedAbilities = {
        ...abilities,
        [abilityKey]: { ...abilities[abilityKey], bonus: safeVal },
      };
      updateAbilities({ abilities: updatedAbilities });
    },
    [updateAbilities] // ★ abilities, species への依存を排除！
  );

  // 能力値その他修正変更
  const handleAbilitiesOtherModifierChange = useCallback(
    (key: string, val: number) => {
      // Refから取得
      const { abilities } = charRef.current;

      const abilityKey = key as keyof typeof abilities;
      const updatedAbilities = {
        ...abilities,
        [abilityKey]: { ...abilities[abilityKey], otherModifier: val },
      };
      updateAbilities({ abilities: updatedAbilities });
    },
    [updateAbilities] // ★ abilities への依存を排除！
  );

  // --- スキル追加 ---
  const handleSkillsAdd = useCallback(() => {
    const newSkill: Skill = {
      id: generateUUID(),
      name: '',
      level: 1,
      effect: '',
    };
    setChar((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  }, [setChar]);

  // --- スキル削除 ---
  const handleSkillsRemove = useCallback(
    (index: number) => {
      setChar((prev) => {
        const targetSkill = prev.skills[index];
        if (targetSkill.id === 's1') {
          alert('このスキルは削除できません。');
          return prev;
        }
        const hasInput =
          targetSkill.name.trim() !== '' ||
          targetSkill.effect.trim() !== '' ||
          targetSkill.level !== 1;

        if (
          hasInput &&
          !window.confirm('入力された内容がありますが、このスキルを削除してもよろしいですか？')
        ) {
          return prev;
        }

        const newSkills = [...prev.skills];
        newSkills.splice(index, 1);
        return { ...prev, skills: newSkills };
      });
    },
    [setChar]
  );

  // --- スキル更新 ---
  const handleSkillsUpdate = useCallback(
    (index: number, field: keyof Skill, value: any) => {
      setChar((prev) => {
        const newSkills = [...prev.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        return { ...prev, skills: newSkills };
      });
    },
    [setChar]
  );

  // --- アイテム追加 ---
  const handleItemsAdd = useCallback(() => {
    const newItem: Item = {
      id: generateUUID(),
      name: '',
      weight: 1,
      quantity: 1,
      notes: '',
    };
    setChar((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  }, [setChar]);

  // --- アイテム削除 ---
  const handleItemsRemove = useCallback(
    (index: number) => {
      setChar((prev) => {
        const newItems = [...prev.items];
        newItems.splice(index, 1);
        return { ...prev, items: newItems };
      });
    },
    [setChar]
  );

  // --- アイテム更新 ---
  const handleItemsUpdate = useCallback(
    (index: number, field: keyof Item, value: any) => {
      setChar((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, items: newItems };
      });
    },
    [setChar]
  );

  // --- 戦闘値・判定系の更新 ---
  const handleCombatModifierChange = useCallback(
    (target: 'combatValues' | 'specialChecks', key: string, newValue: number) => {
      setChar((prev: any) => {
        const targetGroup = prev[target];
        return {
          ...prev,
          [target]: {
            ...targetGroup,
            [key]: { ...(targetGroup[key] || {}), modifier: newValue },
          },
        };
      });
    },
    [setChar]
  );

  // --- 装備品の更新 ---
  const handleEquipmentUpdate = useCallback(
    (slotKey: string, field: string, value: any) => {
      setChar((prev: any) => ({
        ...prev,
        equipment: {
          ...prev.equipment,
          [slotKey]: { ...prev.equipment[slotKey], [field]: value },
        },
      }));
    },
    [setChar]
  );

  // --- リソース（HP/MP/WP）の更新 ---
  const handleResourceUpdate = useCallback(
    (key: 'hp' | 'mp' | 'wp', val: number) => {
      setChar((prev: any) => ({
        ...prev,
        [key]: { ...prev[key], modifier: val },
      }));
    },
    [setChar]
  );

  // --- GLの更新 ---
  const handleGLUpdate = useCallback(
    (val: number) => {
      const clampedVal = Math.max(0, Math.min(val, 6));
      setChar((prev: any) => ({ ...prev, gl: clampedVal }));
    },
    [setChar]
  );

  // 保存処理
  const handleSubmit = useCallback(
    async (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      if (!setIsSubmitting) return;
      setIsSubmitting(true);

      try {
        const finalCharData = { ...charRef.current };

        // 1. IDがない新規作成時はその場で生成
        if (!finalCharData.id) {
          finalCharData.id = generateUUID();
        }

        // 2. 画像圧縮
        if (selectedFile) {
          const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
          const compressedFile = await imageCompression(selectedFile, options);
          finalCharData.image = await new Promise((res) => {
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = () => res(reader.result as string);
          });
        }

        // 3. サーバーへ保存（data.ts 側で index.json も更新されます）
        const result = await saveCharacterAction(finalCharData);

        if (result.success) {
          // 仕様に合わせて window.location.href で遷移
          window.location.href = `/preciousdays/edit?key=${result.id}`;
        } else {
          alert(`保存に失敗しました: ${result.error}`);
          setIsSubmitting(false); // 失敗時はボタンを戻す
        }
      } catch (error) {
        console.error(error);
        alert('保存エラーが発生しました');
        setIsSubmitting(false);
      }
    },
    [selectedFile, setIsSubmitting]
  );

  // 削除処理
  const handleDelete = useCallback(async () => {
    const currentChar = charRef.current;
    if (!currentChar.id || !window.confirm('本当に削除しますか？')) return;
    if (!setIsSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCharacterAction(currentChar.id);
      if (result.success) {
        // 削除後も確実に一覧へ戻すため href を使用
        window.location.href = '/preciousdays';
      } else {
        alert(`削除に失敗しました: ${result.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert('削除エラーが発生しました');
      setIsSubmitting(false);
    }
  }, [setIsSubmitting]);

  return {
    updateAbilities,
    updateAppearance,
    updateBaseField,
    handleSubmit,
    handleDelete,
    handleAbilitiesBonusChange,
    handleAbilitiesOtherModifierChange,
    handleSkillsAdd,
    handleSkillsRemove,
    handleSkillsUpdate,
    handleItemsAdd,
    handleItemsRemove,
    handleItemsUpdate,
    handleCombatModifierChange,
    handleEquipmentUpdate,
    handleResourceUpdate,
    handleGLUpdate,
  };
};
