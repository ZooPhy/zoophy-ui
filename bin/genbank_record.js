'use strict';

let checkInput = require('../bin/validator_tool').checkInput;
const UNKNOWN = 'Unknown';
const FASTA_MET_DEC_DATE_RE = /^\d{4}(\.\d{1,4})?$/;
const SOURCE_GENBANK = 1;
const SOURCE_FASTA = 2;

function stringifyGenes(geneList) {
  if (geneList && geneList.length > 0) {
    let genes = '';
    for (let i = 0; i < geneList.length; i++) {
      let gene = String(geneList[i].name).trim();
      genes += gene;
      if (i < geneList.length-1) {
        genes += ', ';
      }
    }
    return genes.trim();
  }
  else {
    return 'None';
  }
};

function humanizeLuceneDate(luceneDate) {
  if (luceneDate) {
    let date = String(luceneDate);
    if (date != "10000101") {
      if (date.length === 8) {
        let month = getMonth(date.substring(4,6));
        return  date.substring(6) + "-" + month + "-" + date.substring(0,4);
      }
      else if (date.length === 6) {
        let month = getMonth(date.substring(4));
        return month + "-" + date.substring(0,4);
      }
      else if (date.length === 4) {
        return date;
      }
      return date;
    }
  }
  return UNKNOWN;
};

function leapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
};

function convertDecimalDate(decimalDate) {
  var year = parseInt(decimalDate);
  var reminder = decimalDate - year;
  if (reminder > 0){
    var daysPerYear = leapYear(year) ? 366 : 365;
    var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
    var yearDate = new Date(year, 0, 1);
    yearDate = new Date(yearDate.getTime() + miliseconds)
    var date = ("0" + yearDate.getDate()).slice(-2);
    return date + "-" + getMonth(yearDate.getMonth()+1) + "-" + year;
  } else {
    return "01" + "-" + "Jan" + "-" + year;
  }
}

function getMonth(numMonth) {
  numMonth = Number(numMonth);
  switch (numMonth) {
    case 1:
			return "Jan";
		case 2:
			return "Feb";
		case 3:
			return "Mar";
		case 4:
			return "Apr";
		case 5:
			return "May";
		case 6:
			return "Jun";
		case 7:
			return "Jul";
		case 8:
			return "Aug";
		case 9:
			return "Sep";
		case 10:
			return "Oct";
		case 11:
			return "Nov";
		case 12:
			return "Dec";
		default:
			return "__";
	}
};

function simplifyOrganism(rawOrganism) {
  let organism;
  if (rawOrganism) {
    organism = String(rawOrganism);
		let cutoff = organism.indexOf(";");
		if (cutoff === -1 || (organism.indexOf("/") < cutoff && organism.indexOf("/") > 0)) {
			cutoff = organism.indexOf("/");
		}
		if (cutoff === -1 || (organism.indexOf("Viruses") < cutoff && organism.indexOf("Viruses") > 0)) {
			cutoff = organism.indexOf("Viruses");
		}
		if (cutoff === -1 || (organism.indexOf(" virus") < cutoff && organism.indexOf(" virus") > 0)) {
			cutoff = organism.indexOf(" virus");
		}
		if (cutoff > 0) {
			return organism.substring(0, cutoff);
		}
	}
	return String(organism || UNKNOWN);
};

class LuceneRecord {

  constructor(searchApiRecord) {
    this.accession = String(searchApiRecord.accession);
    this.genes = stringifyGenes(searchApiRecord.genes);
    this.virus = simplifyOrganism(searchApiRecord.sequence.organism);
    this.luceneDate = String(searchApiRecord.sequence.collectionDate);
    this.date = humanizeLuceneDate(searchApiRecord.sequence.collectionDate);
    this.unNormalizedDate = String(humanizeLuceneDate(searchApiRecord.sequence.unNormalizedDate) || UNKNOWN)
    if(String(searchApiRecord.sequence.collectionDate) === String(searchApiRecord.sequence.unNormalizedDate)){
      this.isCompleteDate = true;
    }else if(searchApiRecord.sequence.collectionDate != null){
      this.isCompleteDate = false;
    }else{
      this.isCompleteDate = true;
    }
    if (searchApiRecord.host) {
      this.host = String(searchApiRecord.host.name || UNKNOWN);
    }
    else {
      this.host = UNKNOWN;
    }
    if (searchApiRecord.geonameLocation) {
      this.country = String(searchApiRecord.geonameLocation.country || UNKNOWN);
      this.state = String(searchApiRecord.geonameLocation.state || UNKNOWN);
      this.location = String(searchApiRecord.geonameLocation.location || UNKNOWN);
      if((this.location.toLocaleLowerCase()) === (this.country.toLocaleLowerCase())){
        this.location = "Unknown";
      }
      this.geonameid = String(searchApiRecord.geonameLocation.geonameID || UNKNOWN);
      this.latitude = String(searchApiRecord.geonameLocation.latitude || UNKNOWN);
      this.longitude = String(searchApiRecord.geonameLocation.longitude || UNKNOWN);
    }
    else {
      this.country = UNKNOWN;
      this.state = UNKNOWN;
      this.location = UNKNOWN;
      this.geonameid = UNKNOWN;
      this.latitude = UNKNOWN;
      this.longitude = UNKNOWN;
    }
    this.segmentLength = Number(searchApiRecord.sequence.segmentLength);
    this.includeInJob = false;
    this.resourceSource = SOURCE_GENBANK;
  };

};

class SQLRecord {

  constructor(recordApiRecord) {
    this.accession = String(recordApiRecord.accession);
    this.date = String(recordApiRecord.sequence.collectionDate || UNKNOWN);
    if (recordApiRecord.publication) {
      this.pubmedID = String(recordApiRecord.publication.pubMedID || 'n/a');
    }
    else {
      this.pubmedID = 'n/a';
    }
    this.virus = String(recordApiRecord.sequence.organism || UNKNOWN);
    this.taxon = Number(recordApiRecord.sequence.taxID);
    this.strain = String(recordApiRecord.sequence.strain || UNKNOWN);
    this.isolate = String(recordApiRecord.sequence.isolate || UNKNOWN)
    if (recordApiRecord.host) {
      this.host = String(recordApiRecord.host.name || UNKNOWN);
      this.hostId = String(recordApiRecord.host.taxon || UNKNOWN);
    }
    else {
      this.host = UNKNOWN;
      this.hostId = UNKNOWN
    }
    if (recordApiRecord.geonameLocation) {
      this.geonameID = String(recordApiRecord.geonameLocation.geonameID || UNKNOWN);
      this.location = String(recordApiRecord.geonameLocation.location || UNKNOWN);
      this.latitude = String(recordApiRecord.geonameLocation.latitude || UNKNOWN);
      this.longitude = String(recordApiRecord.geonameLocation.longitude || UNKNOWN);
    }
    else {
        this.location = UNKNOWN;
    }
    this.genes = stringifyGenes(recordApiRecord.genes);
    this.definition = String(recordApiRecord.sequence.definition || UNKNOWN)
    if (recordApiRecord.possibleLocations) {
      var possibleLocations = [];
      for(var i=0; i<recordApiRecord.possibleLocations.length; i++){
        var possibleLocation = new PossibleLocation(recordApiRecord.possibleLocations[i]);
        possibleLocations.push(possibleLocation);
      }
      this.possibleLocations = possibleLocations;
    } else {
        this.possibleLocations = [];
    } 
  };

};

class CustomRecord {
  constructor(searchApiRecord) {
    this.accession = String(searchApiRecord.accession);
    this.genes = UNKNOWN;
    this.virus = UNKNOWN;
    this.luceneDate = UNKNOWN;
    this.host = UNKNOWN;
    this.isCompleteDate = true; //assume correct date is uploaded in format
    if(checkInput(searchApiRecord.collectionDate, 'string', FASTA_MET_DEC_DATE_RE)){
      this.date = convertDecimalDate(searchApiRecord.collectionDate);
    } else {
      this.date = searchApiRecord.collectionDate;
    }
    if (searchApiRecord.geonameLocation) {
      this.state = String(searchApiRecord.geonameLocation.state || UNKNOWN);
      this.country = String(searchApiRecord.geonameLocation.country || UNKNOWN);
      this.location = String(searchApiRecord.geonameLocation.location || UNKNOWN);
      this.geonameid = String(searchApiRecord.geonameLocation.geonameID || UNKNOWN);
      this.latitude = String(searchApiRecord.geonameLocation.latitude || UNKNOWN);
      this.longitude = String(searchApiRecord.geonameLocation.longitude || UNKNOWN);
    } else {
      this.state = UNKNOWN;
      this.country = UNKNOWN;
      this.location = UNKNOWN;
      this.geonameid = UNKNOWN;
      this.latitude = UNKNOWN;
      this.longitude = UNKNOWN;
    }
    this.segmentLength = Number(searchApiRecord.rawSequence.length);
    this.sequence =searchApiRecord.rawSequence;
    this.includeInJob = false;
    this.resourceSource = SOURCE_FASTA;
  };
};

class PossibleLocation {

  constructor(recordPossibleLocation) {
    this.geonameID = String(recordPossibleLocation.geonameID || UNKNOWN);
    this.location = String(recordPossibleLocation.location || UNKNOWN);
    this.latitude = String(recordPossibleLocation.latitude || UNKNOWN);
    this.longitude = String(recordPossibleLocation.longitude || UNKNOWN);
    this.probability = String(recordPossibleLocation.probability || UNKNOWN);
  };

};

module.exports = {
  LuceneRecord: LuceneRecord,
  SQLRecord: SQLRecord,
  CustomRecord: CustomRecord,
  PossibleLocation: PossibleLocation
};
