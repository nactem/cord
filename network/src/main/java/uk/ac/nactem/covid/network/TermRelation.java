package uk.ac.nactem.covid.network;

/**
 *
 * @author sam
 */
public class TermRelation extends DocumentRelation {
    private String term;
    
    public TermRelation(int id, int targetId, float score, String term) {
        super(id, targetId, score);
        this.term = term;
    }
    
}
