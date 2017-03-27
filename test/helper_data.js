'use strict';

const SQL_RECORD = {
    "accession": "CY215262",
    "sequence": {
        "accession": "CY215262",
        "definition": "Influenza A virus (A/Maryland/02/2017(H1N1)) nuclear export protein (NEP) and nonstructural protein 1 (NS1) genes, complete cds.",
        "taxID": 1948908,
        "organism": "Influenza A virus (A/Maryland/02/2017(H1N1)) Viruses; ssRNA viruses; ssRNA negative-strand viruses; Orthomyxoviridae; Influenzavirus A.",
        "isolate": null,
        "strain": "A/Maryland/02/2017",
        "collectionDate": "04-Jan-2017",
        "comment": "##FluData-START##EPI_ISOLATE_ID   :: EPI_ISL_244237NAME             :: A/Maryland/02/2017TYPE             :: H1N1Segment_name     :: NSHOST_AGE         :: 3HOST_GENDER      :: MPASSAGE          :: OriginalLOCATION         :: United States / MarylandCOLLECT_DATE     :: 04-Jan-2017Lineage          :: A(H1N1)pdm09SPECIMEN_ID      :: A17001363 ORIGINALSENDER_LAB       :: Maryland Department of Health and MentalHygieneSEQLAB_SAMPLE_ID :: 3025628289EPI_SEQUENCE_ID  :: EPI894229##FluData-END##",
        "rawSequence": "gtgacaaaaacataatggaatccaacaccatgtcaagctttcaggtagactgttttctttggcatattcgcaagcgatttgcagacaatggattgggtgatgccccattccttgatcggctacgccgagatcaaaagtccttaaaaggaagaggcaacacccttggactcgacatcaaaacagccactcttgttgggaaacaaattgtggaatggattttgaaagaggaatccagcgagacacttagaatgacaattgcatctgtacctacttcgcgttacatttctgacatgaccctcgaggaaatgtcacgagactggttcatgcttatgcctaggcaaaaaataataggccctctttgcgtgcgattggaccaggcggtcatggataagaacatagtactggaagcaaacttcagtgtaatcttcaaccgattagagaccttgatactactaagggctttcactgaggagggagcaatagttggagaaatttcaccattaccttctcttccaggacatacttatgaggatgtcaaaaatgcagttggggtcctcatcggaggacttgagtggaatggtaacacggttcgagtctctgaaaatatacagagattcgcttggagaagctgtgatgagaatgggagaccttcactacctccagagcagaaatgagaagtggcgggaacaattgggacagaaatttgaggaaataaggtggctaattgaagaaatacggcacagattgaaagcgacagagaatagtttcgaacaaataacatttatgcaagccttacaactactgcttgaagtagagcaagagataagagctttctcgtttcagcttatttaatgataaaaaacac",
        "segmentLength": 865,
        "isPH1N1": false
    },
    "genes": [{
        "accession": "CY215262",
        "name": "NS"
    }],
    "host": {
        "accession": "CY215262",
        "name": "Homo sapiens; gender M; age 3",
        "taxon": 9606
    },
    "geonameLocation": {
        "geonameID": 4361885,
        "accession": "CY215262",
        "location": "maryland,US",
        "latitude": 39.000389,
        "longitude": -76.749969,
        "geonameType": "ADM1",
        "country": "United States"
    },
    "publication": null
};

const LUCENE_RECORD = {
    "accession": "CY214007",
    "sequence": {
        "accession": "CY214007",
        "definition": "Influenza A virus (A/Wisconsin/03/2017(H3N2)) polymerase PB2 (PB2) gene, complete cds.",
        "taxID": 1940393,
        "organism": "Influenza A virus (A/Wisconsin/03/2017(H3N2)) Viruses; ssRNA viruses; ssRNA negative-strand viruses; Orthomyxoviridae; Influenzavirus A.",
        "isolate": null,
        "strain": "A/Wisconsin/03/2017",
        "collectionDate": "20170103",
        "comment": null,
        "rawSequence": null,
        "segmentLength": 2316,
        "isPH1N1": false
    },
    "genes": [{
        "accession": "CY214007",
        "name": "PB2"
    }],
    "host": {
        "accession": "CY214007",
        "name": "homo sapiens; gender f; age 76",
        "taxon": 9606
    },
    "geonameLocation": {
        "geonameID": 5279468,
        "accession": "CY214007",
        "location": "Wisconsin",
        "latitude": 44.50024,
        "longitude": -90.00041,
        "geonameType": "ADM1",
        "country": "United States"
    },
    "publication": null
};

const TEST_DATA = {
  luceneRecord: LUCENE_RECORD,
  sqlRecord: SQL_RECORD
};

module.exports = TEST_DATA;
