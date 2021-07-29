package uk.ac.nactem.covid.network;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 *
 * @author sam
 */
public class CitationNetworker {
    
    private static final Map<String,Integer> sections = new java.util.HashMap<>();
    
    static {
        sections.put("result",4);
        sections.put("results",4);
        sections.put("discussion",4);
        sections.put("discussions",4);
        sections.put("conclusions",5);
        sections.put("conclusion",5);
        sections.put("methods",3);
        sections.put("method",3);
        sections.put("related_work",2);
        sections.put("background",2);
        sections.put("introduction",1);
        sections.put("motivation",1);
        sections.put("acknowledgements",0);
    }
    
    private static class Source {
        private int frequency;
        private int year;
        private int sectionId;
        public Source(int yr, int freq, int sec) {
            this.year = yr;
            this.frequency = freq;
            this.sectionId = sec;
        }
    }
    
    private static class Citation {
        private int sectionId;
        private final int year;
        private int frequency;
        private final Map<Integer,Source> sources = new java.util.HashMap<>();
        public Citation(int sourceId, int srcYear,
                int sectionId,
                int citeeYear,
                int frequency) {
            this.sources.put(sourceId, new Source(srcYear, frequency, sectionId));
            this.sectionId = sectionId;
            this.year = citeeYear;
            this.frequency = frequency;
        }
    }
    
    public static Map<Integer,List<CitationRelation>> buildCitationNetwork(
            List<Document> documents,
            int citationThreshold,
            LocalDate defaultDate) {
        Map<String,Integer> titles = new java.util.HashMap<>(documents.size());
        for (Document doc : documents) {
            if (doc.getTitle() != null && !doc.getTitle().isBlank()) {
                titles.put(doc.getTitle().strip().toLowerCase(), doc.getId());
            }
        }
        Map<Integer,List<CitationRelation>> relations = new java.util.HashMap<>(1000000);
        Map<String,Citation> externalCitations = new java.util.LinkedHashMap<>(100000);
        for (Document doc : documents) {
            Map<Integer,Citation> citations = new java.util.HashMap<>();
            LocalDate date = doc.getPublishTime();
            if (date == null) {
                date = defaultDate;
            }
            int id = doc.getId();
            if (doc.getAbstracts() != null) {
                for (TextSection a : doc.getAbstracts()) {
                    doCiteSpans(id, date.getYear(),
                            1, a.getCiteSpans(),
                            doc.getBibEntries(),
                            titles,
                            citations,
                            externalCitations);
                }
            }
            if (doc.getBodyText() != null) {
                for (TextSection a : doc.getBodyText()) {
                    String section = a.getSection()!=null?
                            a.getSection().replaceAll("[^A-Za-z0-9 ]", "").strip().toLowerCase():
                            null;
                    Integer sectionId = sections.get(section);
                    if (sectionId == null) {
                        sectionId = 4;
                    }
                    doCiteSpans(id, date.getYear(),
                            sectionId, a.getCiteSpans(),
                            doc.getBibEntries(),
                            titles,
                            citations,
                            externalCitations);
                }
            }
            for (int targetId : citations.keySet()) {
                Citation cit = citations.get(targetId);
                float w = cit.sectionId>2?1.0f:0.5f;
                float reps = (float)cit.frequency;
                float year_w = (float)Math.max(1, Math.abs(date.getYear()- cit.year));
                float score = (reps * w) / year_w;
                if (!relations.containsKey(id)) {
                    relations.put(id, new java.util.ArrayList<>());
                }
                relations.get(id).add(
                        new DirectCitationRelation(id, targetId, score));
            }
        }
        for (String title : externalCitations.keySet()) {
            Citation cit = externalCitations.get(title);
            if (cit.sources.size() < 2 || cit.sources.size() >= citationThreshold) {
                continue;
            }
            List<Integer> srcIds = new java.util.ArrayList<>(cit.sources.keySet());
            for (int i = 0; i < srcIds.size(); ++i) {
                int srcAId = srcIds.get(i);
                Source srcA = cit.sources.get(srcAId);
                int yearA = srcA.year;
                int freqA = srcA.frequency;
                float wA = srcA.sectionId>2?1.0f:0.5f;
                for (int j = i+1; j < srcIds.size(); ++j) {
                    int srcBId = srcIds.get(j);
                    Source srcB = cit.sources.get(srcBId);
                    int avg_year = (yearA+srcB.year)/2;
                    float wB = srcB.sectionId>2?1.0f:0.5f;
                    int year_w = Math.max(1,Math.abs(avg_year- cit.year));
                    float score = (freqA*wA+cit.frequency*wB)/(2*year_w);
                    if (yearA > srcB.year) {
                        if (!relations.containsKey(srcAId)) {
                            relations.put(srcAId, new java.util.ArrayList<>());
                        }
                        relations.get(srcAId).add(
                            new IndirectCitationRelation(srcAId, srcBId, score));
                    }
                    else {
                        if (!relations.containsKey(srcBId)) {
                            relations.put(srcBId, new java.util.ArrayList<>());
                        }
                        relations.get(srcBId).add(
                            new IndirectCitationRelation(srcBId, srcAId, score));
                    }
                }
            }
        }
        return relations;
    }
    
    private static void doCiteSpans(int id, int srcYear, int sectionId,
            Collection<CiteSpan> citeSpans,
            Map<String,BibEntry> bibEntries,
            Map<String,Integer> titles,
            Map<Integer,Citation> citations,
            Map<String,Citation> externalCitations) {
        if (citeSpans != null) {
            for (CiteSpan c : citeSpans) {
                String refId = c.getRefId();
                BibEntry citation = bibEntries.get(refId);
                if (citation != null) {
                    String title = citation.getTitle();
                    String normTitle = title.strip().toLowerCase();
                    Integer year = citation.getYear();
                    Integer targetId = titles.get(normTitle);
                    Citation cit = new Citation(id, srcYear, sectionId,year==null?2020:year,1);
                    if (targetId == null) {
                        if (!title.isBlank()) {
                            if (externalCitations.containsKey(normTitle)) {
                                Citation e = externalCitations.get(normTitle);
                                if (e.sources.containsKey(id)) {
                                    e.sources.get(id).frequency++;
                                    e.sources.get(id).sectionId = 
                                            Math.max(e.sources.get(id).sectionId, sectionId);
                                }
                                else {
                                    e.sources.put(id, new Source(srcYear, 1, sectionId));
                                }
                            }
                            else {
                                externalCitations.put(normTitle, cit);
                            }
                        }
                    }
                    else {
                        if (citations.containsKey(targetId)) {
                            cit = citations.get(targetId);
                            cit.frequency = cit.frequency + 1;
                            cit.sectionId = Math.max(cit.sectionId, sectionId);
                        }
                        else {
                            citations.put(targetId, cit);
                        }
                    }
                }
            }
        }
    }
}
