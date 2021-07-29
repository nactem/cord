package uk.ac.nactem.covid.network;

/**
 *
 * @author sam
 */
public class IndirectCitationRelation extends CitationRelation {

    public IndirectCitationRelation(int id, int targetId, float score) {
        super(id, targetId, score);
    }
    
}
