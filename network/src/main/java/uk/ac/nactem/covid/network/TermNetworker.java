package uk.ac.nactem.covid.network;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 *
 * @author sam
 */
public class TermNetworker {
    
    public static boolean buildTermNetwork(Map<String,Term> terms,
            int clusterThreshold, LocalDate defaultDate) {
        Map<Integer,List<TermRelation>> annotations = new java.util.HashMap<>(1000000);
        for (String term : terms.keySet()) {
            List<Node> cords = terms.get(term).getNodes();
            if (cords.size() < 2 || cords.size()>=clusterThreshold) {
                continue;
            }
            for (int i = 0; i < cords.size(); ++i) {
                Document docI = cords.get(i).getDocument();
                int srcAId = docI.getId();
                docI.getPublishTime();
                LocalDate dateI = docI.getPublishTime();
                if (dateI == null) {
                    dateI = defaultDate;
                }
                int yearI = dateI.getYear();
                for (int j = i+1; j < cords.size(); ++j) {
                    Document docJ = cords.get(j).getDocument();
                    int srcBId = docJ.getId();
                    int yearJ = docJ.getPublishTime()==null?defaultDate.getYear():docJ.getPublishTime().getYear();
                    double w_i = cords.get(i).getCVal();
                    double w_j= cords.get(j).getCVal();
                    double avg_w = (w_i+w_j)/2.0;
                    if(yearI <= yearJ) {
                        if (!annotations.containsKey(srcBId)) {
                            annotations.put(srcBId, new java.util.ArrayList<>());
                        }
                        annotations.get(srcBId).add(
                        new TermRelation(srcBId, srcAId, (float)avg_w, term));
                    }
                    else {
                        if (!annotations.containsKey(srcAId)) {
                            annotations.put(srcAId, new java.util.ArrayList<>());
                        }
                        annotations.get(srcAId).add(
                        new TermRelation(srcAId, srcBId, (float)avg_w, term));
                    }
                }
            }
        }
        return true;
    }
}
