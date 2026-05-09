import React, { useEffect, useMemo, useState } from 'react';
import './CostumeModal.css';
import { useAuth } from '../../context/useAuth';
import {
  createCategory,
  createColor,
  createItemCondition,
  createSize,
  getCategories,
  getColors,
  getItemConditions,
  getSizes,
} from '../../services/inventory';

const ReferenceField = ({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  onCreate,
  optionLabelKey,
  optionValueKey,
  createLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const selectedOption = options.find((option) => String(option[optionValueKey]) === String(value));
    setQuery(selectedOption ? selectedOption[optionLabelKey] : '');
  }, [options, optionLabelKey, optionValueKey, value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option[optionLabelKey].toLowerCase().includes(normalizedQuery));
  }, [options, optionLabelKey, query]);

  const exactMatch = options.find(
    (option) => option[optionLabelKey].toLowerCase() === query.trim().toLowerCase(),
  );

  useEffect(() => {
    if (exactMatch) {
      onValueChange(String(exactMatch[optionValueKey]));
    }
  }, [exactMatch, onValueChange, optionValueKey]);

  const handleSelect = (option) => {
    setQuery(option[optionLabelKey]);
    onValueChange(String(option[optionValueKey]));
    setIsOpen(false);
  };

  const handleCreate = async () => {
    const rawValue = query.trim();
    if (!rawValue) return;
    const created = await onCreate(rawValue);
    handleSelect(created);
  };

  return (
    <div className="form-group reference-field">
      <label>{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          onValueChange('');
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={async (event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (exactMatch) {
            handleSelect(exactMatch);
            return;
          }
          await handleCreate();
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
      />

      {isOpen && (
        <div className="reference-dropdown">
          {filteredOptions.map((option) => (
            <button
              key={option[optionValueKey]}
              type="button"
              className="reference-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              {option[optionLabelKey]}
            </button>
          ))}

          {query.trim() && !exactMatch && (
            <button
              type="button"
              className="reference-option reference-option--create"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleCreate}
            >
              {createLabel} “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CostumeModal = ({ isOpen, onClose, initialData, onSave }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedConditionId, setSelectedConditionId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && token) {
      Promise.all([
        getCategories(token),
        getColors(token),
        getSizes(token),
        getItemConditions(token),
      ])
        .then(([cats, cols, szs, conds]) => {
          setCategories(cats);
          setColors(cols);
          setSizes(szs);
          setConditions(conds);
        })
        .catch((err) => console.error('Erro ao carregar referências:', err));
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setSelectedCategoryId(initialData?.categoryId ? String(initialData.categoryId) : '');
      setSelectedColorId(initialData?.colorId ? String(initialData.colorId) : '');
      setSelectedSizeId(initialData?.sizeId ? String(initialData.sizeId) : '');
      setSelectedConditionId(initialData?.itemConditionId ? String(initialData.itemConditionId) : '');
      setQuantity(initialData?.quantity ? Number(initialData.quantity) : 1);
    } else {
      setSelectedCategoryId('');
      setSelectedColorId('');
      setSelectedSizeId('');
      setSelectedConditionId('');
      setQuantity(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Figurino' : 'Novo Figurino';
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Figurino';
  const rentedQuantity = isEditing
    ? Math.max(0, Number(initialData?.quantity || 0) - Number(initialData?.stock || 0))
    : 0;
  const minQuantity = Math.max(1, rentedQuantity);

  const createReferenceHandler = (creator, setter) => async (name) => {
    const created = await creator({ name }, token);
    setter((currentValues) => [...currentValues, created]);
    return created;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    if (!selectedCategoryId) {
      alert('Por favor seleciona uma Categoria');
      return;
    }
    if (!selectedColorId) {
      alert('Por favor seleciona uma Cor');
      return;
    }
    if (!selectedSizeId) {
      alert('Por favor seleciona um Tamanho');
      return;
    }
    if (!selectedConditionId) {
      alert('Por favor seleciona uma Condição');
      return;
    }

    const costumeData = {
      id: isEditing ? initialData.id : null,
      name: formData.get('name'),
      categoryId: parseInt(selectedCategoryId, 10),
      sizeId: parseInt(selectedSizeId, 10),
      colorId: parseInt(selectedColorId, 10),
      itemConditionId: parseInt(selectedConditionId, 10),
      rentFee: parseFloat(formData.get('rentFee') || 0),
      quantity: parseInt(formData.get('quantity') || quantity || 1, 10),
      imageFile: formData.get('imageFile'),
    };

    onSave(costumeData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Nome</label>
            <input
              name="name"
              type="text"
              placeholder="Ex: Tutu Branco"
              defaultValue={isEditing ? initialData.name : ''}
              required
            />
          </div>

          <div className="form-grid-2">
            <ReferenceField
              label="Categoria"
              placeholder="Escreva uma categoria"
              options={categories}
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              onCreate={createReferenceHandler(createCategory, setCategories)}
              optionLabelKey="categoryName"
              optionValueKey="categoryId"
              createLabel="Criar categoria"
            />
            <ReferenceField
              label="Tamanho"
              placeholder="Escreva um tamanho"
              options={sizes}
              value={selectedSizeId}
              onValueChange={setSelectedSizeId}
              onCreate={createReferenceHandler(createSize, setSizes)}
              optionLabelKey="sizeName"
              optionValueKey="sizeId"
              createLabel="Criar tamanho"
            />
          </div>

          <div className="form-grid-2">
            <ReferenceField
              label="Cor"
              placeholder="Escreva uma cor"
              options={colors}
              value={selectedColorId}
              onValueChange={setSelectedColorId}
              onCreate={createReferenceHandler(createColor, setColors)}
              optionLabelKey="colorName"
              optionValueKey="colorId"
              createLabel="Criar cor"
            />
            <ReferenceField
              label="Condição"
              placeholder="Escreva uma condição"
              options={conditions}
              value={selectedConditionId}
              onValueChange={setSelectedConditionId}
              onCreate={createReferenceHandler(createItemCondition, setConditions)}
              optionLabelKey="itemConditionName"
              optionValueKey="itemConditionId"
              createLabel="Criar condição"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Quantidade</label>
              <input
                name="quantity"
                type="number"
                min={minQuantity}
                step="1"
                value={quantity}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value);
                  if (!Number.isFinite(nextQuantity)) {
                    setQuantity(minQuantity);
                    return;
                  }
                  setQuantity(Math.max(minQuantity, nextQuantity));
                }}
                required
              />
              {isEditing && (
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                  Não pode ser inferior a {minQuantity} porque existem unidades atualmente alugadas.
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Preço de Aluguer (€)</label>
              <input
                name="rentFee"
                type="number"
                step="0.01"
                min="0"
                defaultValue={isEditing ? initialData.rentFee : '0'}
                required
              />
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Imagem do Figurino</label>
            <input name="imageFile" type="file" accept="image/*" />
            {isEditing && initialData.images && initialData.images[0] && (
              <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                Imagem atual disponível. Envie um novo ficheiro para a substituir.
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostumeModal;
