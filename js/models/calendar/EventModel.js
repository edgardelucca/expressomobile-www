define([
    'underscore',
    'backbone',
    'shared',
    'models/contacts/ContactModel',
    'collections/contacts/DetailsContactCollection',
    'json2'
], function(_, Backbone, Shared, ContactModel, DetailsContactCollection, json2)
{
    var EventModel = Backbone.Model.extend(
	    {
		defaults:
			{
			    eventID: '',
			    eventDate: '',
			    eventName: '',
			    eventDescription: '',
			    eventLocation: '',
			    eventParticipants: [],
			    eventParticipantsLdap: [],
			    eventStartDate: '',
			    eventEndDate: '',
			    eventAllDay: "0",
			    eventExParticipants: '',
			    eventCategoryID: '',
			    eventDateEnd: '',
			    eventDateStart: '',
			    eventOwner: '',
			    eventOwnerIsParticipant: '',
			    eventPriority: '',
			    eventTimeEnd: '',
			    eventTimeStart: '',
			    eventType: ''
			},
		initialize: function()
		{
		    this.api = Shared.api;
		    this.readResource = '/Calendar/Events';
		    this.updateResource = '';
		    this.createResource = '';
		    this.deleteResource = '';
		},
		route: function()
		{
		    return '/Calendar';
		},
		done: function(value)
		{
		    this.done = value;

		    return this;
		},
		fail: function(value)
		{
		    this.fail = value;

		    return this;
		},
		getEvent: function(pEventID)
		{
		    var that = this;
		    this.api
			    .resource('Calendar/Event')
			    .params({eventID: pEventID})
			    .done(function(result)
			    {
				that.set(result.events[0]);
				that.getEventOwner();
			    })
			    .fail(function(error)
			    {
				if (that.fail)
				    that.fail(error);
			    })
			    .execute();
		    return that;
		},
		getPriority: function()
		{
		    var priority = ['-', 'Baixa', 'Normal', 'Alta'];
		    return priority[this.get('eventPriority')];
		},
		getEventParticipants: function(callback)
		{
		    var listParticipants = this.get('eventParticipants');
		    var listUidNumbers = []
		    var that = this;

		    var detailsContactCollection = new DetailsContactCollection();


		    if (Shared.expressoVersion === '3.0') {
			for (var i in listParticipants) {
			    listUidNumbers.push(listParticipants[i].contactUIDNumber);

			    detailsContactCollection.add({
				contactFullName: listParticipants[i].contactName
			    });

			}
			that.set({eventParticipantsLdap: detailsContactCollection.models});
			if (that.done) {
			    that.done(that);
			}

		    } else {
			for (var i in listParticipants) {
			    listUidNumbers.push(parseInt(listParticipants[i].contactUIDNumber));
			}
		    }

		    if (Shared.expressoVersion !== '3.0') {
			var pContactID = JSON.stringify(listUidNumbers);

			var detailsContactCollection = new DetailsContactCollection();
			detailsContactCollection.getGeneralContactDetails(pContactID)
				.done(function(data)
				{
				    that.set({eventParticipantsLdap: data.models});
				    if (that.done)
					that.done(that)
				})
				.fail(function(error)
				{
				    if (that.fail)
					that.fail(error);
				})

		    }
		},
		getEventOwner: function(callback)
		{
		    var that = this;
		    if (Shared.expressoVersion !== '3.0') {
			var detailsContactCollection = new DetailsContactCollection();
			detailsContactCollection.getGeneralContactDetails(this.get('eventOwner'))
				.done(function(data)
				{
				    console.log(data.models[0]);
				    that.set({eventOwner: data.models[0]});
				    that.getEventParticipants();
				})
				.fail(function(error)
				{
				    if (that.fail)
					that.fail(error);
				});
		    } else {
			var contactModel = new ContactModel({
			    contactUIDNumber: this.get('eventOwner'),
			    contactFullName: this.get('eventOwnerName')
			});
			that.set({eventOwner: contactModel});
			that.getEventParticipants();
		    }
		},
		saveEvent: function(params)
		{
		    var that = this;
		    this.api
			    .resource('Calendar/AddEvent')
			    .params(params)
			    .done(function(result)
			    {
				var thisModel = new EventModel(result.events[0]);
				if (that.done)
				    that.done(thisModel);
			    })
			    .fail(function(error)
			    {
				if (that.fail)
				    that.fail(error);
			    })
			    .execute();
		    return that;
		},
		deleteEvent: function(pEventID)
		{
		    var that = this;
		    this.api
			    .resource('Calendar/DelEvent')
			    .params({eventID: pEventID})
			    .done(function(result)
			    {
				if (that.done)
				    that.done(result);
			    })
			    .fail(function(error)
			    {
				if (that.fail)
				    that.fail(error);
			    })
			    .execute();

		    return that;
		},
		execute: function()
		{
		    return this.api.execute();
		}
	    });
    return EventModel;
});