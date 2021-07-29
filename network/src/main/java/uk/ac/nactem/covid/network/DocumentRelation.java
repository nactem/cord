package uk.ac.nactem.covid.network;

/**
 *
 * @author sam
 */
public abstract class DocumentRelation {

    private final int id, targetId;
    private final float score;
    
    public DocumentRelation(int id, int targetId, float score) {
        this.id = id;
        this.targetId = targetId;
        this.score = score;
    }
}
