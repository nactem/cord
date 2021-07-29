package uk.ac.nactem.covid.network;

/**
 *
 * @author sam
 */
public abstract class CitationRelation extends DocumentRelation {

    public CitationRelation(int id, int targetId, float score) {
        super(id, targetId, score);
    }
    
}
