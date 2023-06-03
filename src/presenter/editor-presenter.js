import Presenter from './presenter.js';
import Type from '../enum/type.js';
import TypeLabel from '../enum/type-label.js';

/**
 * @template {ApplicationModel} Model
 * @template {EditorView} View
 * @extends Presenter<Model,View>
 */
export default class EditorPresenter extends Presenter {
  #point;

  /**
   * @param {[model: Model, view: View]} args
   */
  constructor(...args) {
    super(...args);

    this.buildTypeSelectView();
    this.buildDestinationSelectView();

    document.addEventListener('point-edit', this.onPointEdit.bind(this));

    this.view.typeSelectView.addEventListener(
      'change',
      this.onTypeSelectChange.bind(this)
    );

    this.view.destinationSelectView.addEventListener(
      'change',
      this.updateDestinationDetailsView.bind(this)
    );
  }

  buildTypeSelectView() {
    /** @type {[string, PointType][]} */
    const options = Object.values(Type).map((value) => {
      const key = Type.findKey(value);
      const label = TypeLabel[key];

      return [label, value];
    });

    this.view.typeSelectView.setOptions(options);
  }

  buildDestinationSelectView() {
    /** @type {[string, string][]} */
    const options = this.model.destinations.listAll().map(
      (item) => ['', item.name]
    );

    this.view.destinationSelectView
      .setOptions(options);
  }

  buildOfferSelectView() {
    const type = this.view.typeSelectView.getValue();
    const availableOffers = this.model.offerGroups.findById(type).items;

    /** @type {[number, string, number][]} */
    const options = availableOffers.map((offer) => [offer.id, offer.title, offer.price]);

    this.view.offerSelectView.setOptions(options);
  }

  updateTypeSelectView() {
    this.view.typeSelectView.setValue(this.#point.type);
  }

  updateDestinationSelectView() {
    const label = TypeLabel[Type.findKey(this.#point.type)];
    const destination = this.model.destinations.findById(this.#point.destinationId);

    this.view.destinationSelectView
      .setLabel(label)
      .setValue(destination.name);
  }

  updateDatePickerView() {
    this.view.datePickerView
      .setStartDate(this.#point.startDate)
      .setEndDate(this.#point.endDate);
  }

  updatePriceInput() {
    this.view.priceInputView.setValue(this.#point.basePrice);
  }

  updateOfferSelectView() {
    const type = this.view.typeSelectView.getValue();
    const availableOffers = this.model.offerGroups.findById(type).items;
    const optionsChecked = availableOffers.map(
      (offer) => (this.#point.offerIds.includes(offer.id))
    );

    this.view.offerSelectView.setOptionsChecked(optionsChecked);
  }

  updateDestinationDetailsView() {
    const name = this.view.destinationSelectView.getValue();
    const destination = this.model.destinations.findBy('name', name);

    /** @type {[string, string][]} */
    const pictureOptions = destination.pictures.map(
      ({ src, description }) => [ src, description ]
    );

    this.view.destinationDetailsView
      .setDescription(destination.description)
      .setPictures(pictureOptions);
  }

  updateView() {
    this.updateTypeSelectView();
    this.updateDestinationSelectView();
    this.updateDatePickerView();
    this.updatePriceInput();
    this.buildOfferSelectView();
    this.updateOfferSelectView();
    this.updateDestinationDetailsView();

    return this;
  }

  onPointEdit(event) {
    this.#point = this.model.points.findById(event.detail);

    this.view.close();
    this.updateView();
    this.view
      .link(event.target)
      .open();
  }

  onTypeSelectChange() {
    const type = this.view.typeSelectView.getValue();
    const typeLabel = TypeLabel[Type.findKey(type)];

    this.view.destinationSelectView.setLabel(typeLabel);
    this.buildOfferSelectView();
  }
}
