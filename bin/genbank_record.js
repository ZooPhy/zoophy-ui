'use strict';

const UNKNOWN = 'Unknown';

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
    this.date = humanizeLuceneDate(searchApiRecord.sequence.collectionDate);
    if (searchApiRecord.host) {
      this.host = String(searchApiRecord.host.name || UNKNOWN);
    }
    else {
      this.host = UNKNOWN;
    }
    if (searchApiRecord.geonameLocation) {
      this.country = String(searchApiRecord.geonameLocation.country || UNKNOWN);
    }
    else {
      this.country = UNKNOWN;
    }
    this.segmentLength = Number(searchApiRecord.sequence.segmentLength);
    this.includeInJob = false;
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
    }
    else {
      this.host = 'Unknown';
    }
    if (recordApiRecord.geonameLocation) {
      this.location = String(recordApiRecord.geonameLocation.location || UNKNOWN);
    }
    else {
        this.location = 'Unknown';
    }
    this.genes = stringifyGenes(recordApiRecord.genes);
    this.definition = String(recordApiRecord.sequence.definition || UNKNOWN)
  };

};

module.exports = {
  LuceneRecord: LuceneRecord,
  SQLRecord: SQLRecord
};
